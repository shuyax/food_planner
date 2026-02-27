import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL
from datetime import date, datetime, timedelta
import time
from selenium.webdriver import ActionChains

def go_to_target_day(driver, days_later=7):
    driver.get(BASE_URL)
    current_view = driver.find_element(By.XPATH, "//button[contains(@title, 'view') and @aria-pressed='true']")
    assert current_view.text.lower() == "week", "default view should be week view"
    today_cell = driver.find_elements(By.XPATH, "//td[contains(@class, 'fc-day-today')]")
    assert len(today_cell) == 1, "There should be only one td cell is marked as today"
    today_obj = datetime.strptime(today_cell[0].get_attribute("data-date"), "%Y-%m-%d")
    target_day = today_obj + timedelta(days=days_later)
    target_day_str = target_day.strftime("%Y-%m-%d")
    while not driver.find_elements(By.XPATH, f"//th[@data-date='{target_day_str}']"):
        if days_later > 0:
            driver.find_element(
                By.XPATH, "//button[contains(@class, 'fc-next-button')]"
            ).click()
        else:
            driver.find_element(
                By.XPATH, "//button[contains(@class, 'fc-prev-button')]"
            ).click()
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//th[contains(@class,'fc-day')]"))
        )
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, f"//th[@data-date='{target_day_str}']"))
    )
    cell = WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, f"//td[@data-date='{target_day_str}']")))
    assert cell.is_displayed(), "The day cell should be visible"
    # Scroll into center to avoid header overlap
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", cell)        
    # cell.click()
    ActionChains(driver).move_to_element(cell).click().perform()
    WebDriverWait(driver, 30).until(EC.url_contains("/day-meals"))
    assert f"/day-meals?date={target_day_str}" in driver.current_url
    meal_date_h1 = driver.find_element(By.ID, "meal-date")
    assert meal_date_h1.text == target_day_str, "The correct target day should be visible"
    return target_day_str

def switch_mode(driver, current_mode):
    if current_mode == 'browse':
        edit_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "edit-btn"))
        )
        assert edit_btn.is_displayed(), "Edit button should be visible under browse mode"
        driver.execute_script("arguments[0].click();", edit_btn)
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "save-btn"))
        )
    elif current_mode == 'edit':
        save_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "save-btn"))
        )
        assert save_btn.is_displayed(), "Save button should be visible under edit mode"
        driver.execute_script("arguments[0].click();", save_btn)
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "edit-btn"))
        )

def get_existing_meal_number(driver):
    day_cell = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "day-cell"))
    )
    day_cell_children = day_cell.find_elements(By.XPATH, "./*")
    return len(day_cell_children)

def get_existing_meal_food_number(driver, meal_type):
    meal_foods_children = driver.find_elements(By.XPATH, f"//div[@id='meal-section-{meal_type.lower()}']/ol[contains(@class, 'meal-foods-edit')]/*")
    return len(meal_foods_children)

def create_meal(driver, meal_type):
    """Creates a meal of given type on the page. Duplicate creation should be ignored."""
    meal_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "meal-type"))
    )
    Select(meal_select).select_by_visible_text(meal_type)
    # Wait for the meal section to appear
    meal_section = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, f"meal-section-{meal_type}"))
    )
    assert meal_section.is_displayed(), "The meal lunch should be visible"
    # Check that there is only ONE section for this meal type
    meal_sections = driver.find_elements(By.ID, f"meal-section-{meal_type}")
    assert len(meal_sections) == 1, f"Duplicate meal '{meal_type}' should not be created"
    return meal_sections[0]
    
def delete_meal(driver, active_meal):
    meal_type = active_meal.find_element(By.XPATH, "./strong").text.lower()
    meal_delete_btns = active_meal.find_elements(By.CLASS_NAME, "meal-delete-btn")
    assert len(meal_delete_btns) == 1, "There should be only one meal delete button under the active meal"
    meal_delete_btn_id = meal_delete_btns[0].get_attribute("id")
    WebDriverWait(active_meal, 10).until(
        EC.element_to_be_clickable((By.ID, meal_delete_btn_id))
    )
    meal_delete_btns[0].click()
    WebDriverWait(active_meal, 10).until(
        EC.invisibility_of_element_located((By.ID, meal_delete_btn_id))
    )
    meal_delete_btns = driver.find_elements(By.ID, meal_delete_btn_id)
    assert len(meal_delete_btns) == 0, "Meal delete button should not exist under edit mode after delete"
    assert len(driver.find_elements(By.ID, f"meal-section-{meal_type}")) == 0, "The meal section deleted should not exist under edit mode"

def activate_meal(driver, active_meal_type):
    save_btns = driver.find_elements(By.ID, "day-meals-checkmark")
    if len(save_btns) == 0:
        current_mode = 'browse'
        switch_mode(driver, current_mode)
    active_meal_section = driver.find_element(By.ID, f"meal-section-{active_meal_type}")
    assert active_meal_section.is_displayed(), "The meal section to be activated should be visible"
    active_meal_section.click()
    # wait until meal activateed
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, f"food-add-btn-{active_meal_type}"))
    )
    active_meal_section = driver.find_element(By.ID, f"meal-section-{active_meal_type}")
    return active_meal_section
    
def add_food_to_meal(driver, active_meal, food_name):
    meal_type = active_meal.find_element(By.XPATH, "./strong").text.lower()
    food_select_elems = active_meal.find_elements(By.ID, f"{meal_type}-")
    # no empty food select exists
    if len(food_select_elems) == 0:
        add_btn = WebDriverWait(active_meal, 10).until(
            EC.element_to_be_clickable((By.XPATH, "./button[@class='food-add-btn']"))
        )
        add_btn.click()
    # Wait for the new food select to appear
    food_select_elem = WebDriverWait(active_meal, 10).until(
        EC.presence_of_element_located((By.ID, f"{meal_type}-"))
    )
    # Assert the food is not already present
    existing_options = [o.text.lower() for o in Select(food_select_elem).options]
    assert food_name.lower() in existing_options, f"{food_name} should be in options"
    Select(food_select_elem).select_by_visible_text(food_name)
    # Check that after clicking add again, this food does NOT appear in the new dropdown
    add_btn = WebDriverWait(active_meal, 10).until(
        EC.element_to_be_clickable((By.XPATH, "./button[@class='food-add-btn']"))
    )
    add_btn.click()
    new_food_select_elem = WebDriverWait(active_meal, 10).until(
        EC.presence_of_element_located((By.ID, f"{meal_type}-"))
    )
    new_options = [o.text.lower() for o in Select(new_food_select_elem).options]
    assert food_name.lower() not in new_options, f"{food_name} should not appear again in options"
    assert len(driver.find_elements(By.ID, f"{meal_type}-{food_name.lower()}")) == 1, "The food deleted from meal should be displayed as a select"

def delete_food_from_meal(driver, active_meal, food_name):
    meal_type = active_meal.find_element(By.XPATH, "./strong").text.lower()
    food_select_elem = WebDriverWait(active_meal, 10).until(
        EC.presence_of_element_located((By.XPATH, f".//select[contains(@id,'{food_name.lower()}')]"))
    )
    food_delete_btn = WebDriverWait(food_select_elem, 10).until(
        EC.element_to_be_clickable((By.XPATH, "following-sibling::*[contains(@class, 'food-delete-btn')]"))
    )
    assert food_delete_btn.is_displayed(), f"Food delete button should exist"
    food_delete_btn.click()
    WebDriverWait(active_meal, 10).until(
        EC.invisibility_of_element_located((By.XPATH, "following-sibling::*[contains(@class, 'food-delete-btn')]"))
    )
    # food_name should be in the option again
    add_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, f"food-add-btn-{meal_type}"))
    )
    add_btn.click()
    new_food_select_elem = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, f"{meal_type}-"))
    )
    new_options = [o.text.lower() for o in Select(new_food_select_elem).options]
    assert food_name.lower() in new_options, f"{food_name} should appear again in options"
    assert len(driver.find_elements(By.ID, f"{meal_type}-{food_name.lower()}")) == 0, "The food deleted from meal should not be displayed as a select"

def update_food_in_meal(driver, active_meal, existing_food_name, new_food_name):
    meal_type = active_meal.find_element(By.XPATH, "./strong").text.lower()
    food_select_elem = WebDriverWait(active_meal, 10).until(
        EC.presence_of_element_located((By.XPATH, f".//select[contains(@id,'{existing_food_name.lower()}')]"))
    )
    Select(food_select_elem).select_by_visible_text(new_food_name.lower())
    time.sleep(5)
    new_food_select_elems = driver.find_elements(By.ID, f"{meal_type}-{new_food_name.lower()}")
    assert len(new_food_select_elems) == 1, "The updated food should be visible"

def navigate_to_food_page(driver, meal_type, food_name):
    food = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, f"{meal_type}-{food_name}"))
    )
    food.click()
    WebDriverWait(driver, 10).until(
        lambda d: "/day-meals" not in d.current_url
    )
    assert "?lastpage=day-meals?date=" in driver.current_url and "/food/" in driver.current_url, "Should be navigated to the food page"
    assert WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "food-name"))
    ).text.lower() == food_name, "The food page should match the food clicked"

def update_food_name(driver, current_food_name, updated_food_name):
    food_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "edit-food-name"))
    )
    assert food_name_input.get_attribute("value").lower() == current_food_name.lower(), "The current food name should be displayed"
    food_name_input.clear()
    food_name_input.send_keys(updated_food_name)
    food_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "edit-food-name"))
    )
    assert food_name_input.get_attribute("value").lower() == updated_food_name.lower(), "The updated food name should be displayed"

def update_food_description(driver, current_food_description, updated_food_description):
    food_description_inpput = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "edit-food-description"))
    )
    assert food_description_inpput.get_attribute("value").lower() == current_food_description.lower(), "The current food desscription should be displayed"
    food_description_inpput.clear()
    food_description_inpput.send_keys(updated_food_description)
    food_description_inpput = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "edit-food-description"))
    )
    assert food_description_inpput.get_attribute("value").lower() == updated_food_description.lower(), "The current food desscription should be displayed"

def create_new_ingredient_in_modal(driver, new_ingredient_name, new_ingredient_unit):
    create_ingredient_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "create-ingredient"))
    )
    assert create_ingredient_btn.is_displayed(), "create_ingredient_btn should be visible and clickable"
    create_ingredient_btn.click()
    modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "modal"))
    )
    ingredient_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ingredient-name-input"))
    )
    assert ingredient_name_input.get_attribute("value").lower() == "", "Ingredient name should be empty by default"
    assert WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ingredient-create"))
    ).get_attribute("disabled") is not None, "Create ingredient button should be disabled when ingredient name is empty"
    ingredient_name_input.send_keys(new_ingredient_name)
    ingredient_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ingredient-name-input"))
    )
    assert ingredient_name_input.get_attribute("value").lower() == new_ingredient_name.lower(), "New ingredient name should be visible"
    create_ingredient_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ingredient-create"))
    )
    assert create_ingredient_btn.get_attribute("disabled") is None, "Create ingredient button should not be disabled when ingredient name is not empty"
    unit_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "canonical-unit"))
    )
    assert unit_input.get_attribute("value").lower() == "", "Ingredient unit should be empty by default"
    Select(unit_input).select_by_visible_text(new_ingredient_unit.lower())
    assert unit_input.get_attribute("value").lower() in new_ingredient_unit.lower(), "Ingredient unit should be updated"
    create_ingredient_btn.click()
    note = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ingredient-form-note"))
    )
    assert f"Ingredient {new_ingredient_name.lower()} created successfully!".lower() in note.text.lower(), "Submition note should be visible"
    modal_backdrop = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CLASS_NAME, "modal-backdrop"))
    )
    modal_backdrop.click()
    WebDriverWait(driver, 10).until(
        lambda d: (
            not d.find_elements(By.ID, "ingredient-modal") or
            all(not m.is_displayed() for m in d.find_elements(By.ID, "ingredient-modal"))
        )
    )

def add_ingredient_to_food(driver, new_ingredient_name, quantity, new_ingredient_note):
    add_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "add-ingredient"))
    )
    assert add_btn.is_displayed(), "Add ingredient button should be visible"
    add_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "add-ingredient"))
    )
    driver.execute_script("arguments[0].click();", add_btn)
    ingredient_container = driver.find_element(By.ID, "ingredients-edit")
    ingredient_select = ingredient_container.find_elements(By.TAG_NAME, "select")[-1]
    assert ingredient_select.is_displayed(), "A new ingredient select should be visible"
    new_ingredient_index = ingredient_select.get_attribute("id").replace("ingredient-","")
    Select(ingredient_select).select_by_visible_text(new_ingredient_name.lower())
    ingredient_container = driver.find_element(By.ID, "ingredients-edit")
    ingredient_select = ingredient_container.find_elements(By.TAG_NAME, "select")[-1]
    assert ingredient_select.get_attribute("value").lower() == new_ingredient_name.lower(), "The new ingredient should be visible"
    unit_input = driver.find_element(By.ID, f"quantity-{new_ingredient_index}")
    assert unit_input.get_attribute("value") == "0", "The default quantity should be 0"
    unit_input.clear()
    unit_input.send_keys(quantity)
    unit_input = driver.find_element(By.ID, f"quantity-{new_ingredient_index}")
    assert unit_input.get_attribute("value") == str(quantity), "The quantity should be updated"
    note = driver.find_element(By.ID, f"ingredient-note-{new_ingredient_index}")
    assert note.text == "", "The note should be empty by default"
    note.clear()
    note.send_keys(new_ingredient_note)
    note = driver.find_element(By.ID, f"ingredient-note-{new_ingredient_index}")
    assert note.text.lower() == new_ingredient_note.lower(), "The note should be updated"

def update_ingredient_in_food(driver, existing_ingredient_name, updated_ingredient):
    ingredient_select = next(
        (select for select in driver.find_elements(By.TAG_NAME, "select")
        if select.get_attribute("value").lower() == existing_ingredient_name.lower()),
        None  # default if no match is found
    )
    index = ingredient_select.get_attribute("id").replace("ingredient-","")
    Select(ingredient_select).select_by_visible_text(updated_ingredient["name"].lower())
    select = driver.find_element(By.ID, f"ingredient-{index}")
    assert select.get_attribute("value").lower() == updated_ingredient["name"].lower(), "The select should be updated"
    unit = driver.find_element(By.ID, f"quantity-{index}")
    assert unit.get_attribute("value") == "0", "The unit input should be cleared"
    unit.clear()
    unit.send_keys(updated_ingredient["quantity"])
    unit = driver.find_element(By.ID, f"quantity-{index}")
    assert unit.get_attribute("value") == str(updated_ingredient["quantity"]), "The unit input should be updated"
    note = driver.find_element(By.ID, f"ingredient-note-{index}")
    assert note.get_attribute("value") == "", "The note input should be cleared"
    note.clear()
    note.send_keys(updated_ingredient["note"])
    note = driver.find_element(By.ID, f"ingredient-note-{index}")
    assert note.get_attribute("value") == updated_ingredient["note"], "The note input should be updated"

def delete_ingredient_from_food(driver, ingredient_name):
    ingredient_select = [select for select in driver.find_elements(By.TAG_NAME, "select") if select.get_attribute("value").lower() == ingredient_name.lower()]
    assert len(ingredient_select) == 1, "There should be only select found"    
    index = ingredient_select[0].get_attribute("id").replace("ingredient-","")
    delete_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, f"remove-btn-{index}"))
    )
    ingredient_row_li_len = len(driver.find_elements(By.CLASS_NAME, "ingredient-row-li"))
    driver.execute_script("arguments[0].click();", delete_btn)
    ingredient = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, f"ingredient-{index}"))
    )
    ingredient_row_li_len_new = len(driver.find_elements(By.CLASS_NAME, "ingredient-row-li"))
    assert ingredient_row_li_len_new == ingredient_row_li_len - 1, "The ingredient row should be decreased by one"
    assert ingredient.get_attribute("value") != ingredient_name.lower(), "The ingredient with same index should be updated"






def test_create_meal_and_add_foods(driver):
    target_day = go_to_target_day(driver, 7)
    # switch mode from browse to edit
    switch_mode(driver, "browse")
    assert get_existing_meal_number(driver) == 0, "There should be no meal on the target day"
    # Create meals
    create_meal(driver, "dinner")
    assert get_existing_meal_number(driver) == 1, "There should be a meal added on the target day"
    assert get_existing_meal_food_number(driver, "dinner") == 0, "There should be no food under the meal"
    create_meal(driver, "lunch")
    assert get_existing_meal_number(driver) == 2, "There should be another meal added on the target day"
    # Add foods
    dinner = activate_meal(driver, "dinner")
    add_food_to_meal(driver, dinner, "spicy sour noodle")
    add_food_to_meal(driver, dinner, "stir fry bok choy")
    # Save
    switch_mode(driver, "edit")
    # Verify
    meal_foods = driver.find_element(By.ID, "meal-foods-dinner")
    assert "spicy sour noodle" in meal_foods.text.lower()
    assert "stir fry bok choy" in meal_foods.text.lower() 

def test_delete_meal(driver):
    target_day = go_to_target_day(driver, -19)
    switch_mode(driver, "browse")
    lunch = create_meal(driver, "lunch")
    lunch.click()
    switch_mode(driver, "edit")
    meal_sections = driver.find_elements(By.ID, "meal-section-lunch")
    assert len(meal_sections) == 1, "The meal section should be visible before delete"
    switch_mode(driver, "browse")
    active_lunch = activate_meal(driver, "lunch")
    delete_meal(driver, active_lunch)
    lunch_edit_mode = driver.find_elements(By.ID, "meal-section-lunch")
    assert len(lunch_edit_mode) == 0, "The meal deleted should not be visible under edit mode"
    switch_mode(driver, "edit")
    lunch_edit_mode = driver.find_elements(By.ID, "meal-section-lunch")
    assert len(lunch_edit_mode) == 0, "The meal deleted should not be visible under browse mode"

def test_delete_food_from_meal(driver):
    target_day = go_to_target_day(driver, -12)
    switch_mode(driver, "browse")
    create_meal(driver, "dinner")
    dinner = activate_meal(driver, "dinner")
    add_food_to_meal(driver, dinner, "spicy sour noodle")
    switch_mode(driver, "edit")
    meal_foods = driver.find_element(By.ID, "meal-foods-dinner")
    assert "spicy sour noodle" in meal_foods.text.lower()
    switch_mode(driver, "browse")
    dinner = activate_meal(driver, "dinner")
    delete_food_from_meal(driver, dinner, "spicy sour noodle")
    switch_mode(driver, "edit")
    meal_foods = driver.find_element(By.ID, "meal-foods-dinner")
    assert "spicy sour noodle" not in meal_foods.text.lower()

def test_add_additional_food_into_meal(driver):
    target_day = go_to_target_day(driver, -8)
    switch_mode(driver, "browse")
    meal_type = "breakfast"
    create_meal(driver, meal_type)
    meal = activate_meal(driver, meal_type)
    add_food_to_meal(driver, meal, "overnight oats")
    switch_mode(driver, "edit")
    meal_foods = driver.find_element(By.ID, f"meal-foods-{meal_type}")
    assert "overnight oats" in meal_foods.text.lower()
    new_food_name = "taro milk tea"
    assert new_food_name not in meal_foods.text.lower() 
    active_meal = activate_meal(driver, meal_type)
    add_food_to_meal(driver, active_meal, new_food_name)
    switch_mode(driver, "edit")
    meal_foods = driver.find_element(By.ID, f"meal-foods-{meal_type}")
    assert "overnight oats" in meal_foods.text.lower()
    assert new_food_name in meal_foods.text.lower() 

def test_update_existing_food_in_meal(driver):
    meal_type = "breakfast"
    existing_food_name = "overnight oats"
    updated_food_name = "taro milk tea"
    target_day = go_to_target_day(driver, -9)
    switch_mode(driver, "browse")
    create_meal(driver, meal_type)
    meal = activate_meal(driver, meal_type)
    add_food_to_meal(driver, meal, existing_food_name)
    switch_mode(driver, "edit")
    meal_foods = driver.find_element(By.ID, f"meal-foods-{meal_type}")
    assert existing_food_name in meal_foods.text.lower()
    assert updated_food_name not in meal_foods.text.lower() 
    active_meal = activate_meal(driver, meal_type)
    update_food_in_meal(driver, active_meal, existing_food_name, updated_food_name)
    switch_mode(driver, "edit")
    meal_foods = driver.find_element(By.ID, f"meal-foods-{meal_type}")
    assert existing_food_name not in meal_foods.text.lower()
    assert updated_food_name in meal_foods.text.lower() 

def test_view_food_from_meal(driver):
    meal_type = "breakfast"
    food_name = "taro milk tea"
    target_day = go_to_target_day(driver, -12)
    switch_mode(driver, "browse")
    create_meal(driver, meal_type)
    meal = activate_meal(driver, meal_type)
    add_food_to_meal(driver, meal, food_name)
    switch_mode(driver, "edit")
    meal_foods = driver.find_element(By.ID, f"meal-foods-{meal_type}")
    assert food_name in meal_foods.text.lower()
    navigate_to_food_page(driver, meal_type, food_name)
    assert len(driver.find_elements(By.ID, "ingredient-title")) == 1 and len(driver.find_elements(By.ID, "instruction-title")) == 1, "Ingredients and Instructions should be visible"
    assert len(driver.find_elements(By.XPATH, "//*[@id='ingredients-browse']/li")) == 2, "All ingredients are displayed"
    assert driver.find_element(By.ID, "food-description").text != '', "Food recipe is displayed"
    switch_mode(driver, "browse")

def test_edit_food_from_meal(driver):
    meal_type = "drink"
    current_food_name = "taro milk tea"
    updated_food_name = "taro oat milk tea"
    current_food_description = "how to make taro milk tea"
    updated_food_description = f'''Dissolve: In a cup, whisk the taro powder into the hot water until fully dissolved and no clumps remain.
Sweeten: Stir in your chosen sweetener (condensed milk is recommended for creaminess).
Combine: Pour in the milk and stir well.
Serve: Pour over ice. '''
    new_ingredient_name = "oat milk"
    new_ingredient_unit = "cup (cup)"
    new_ingredient_quantity = 5
    new_ingredient_note="Oatly Original Oat Milk"
    existing_ingredient_name = "milk"
    updated_ingredient = {
        "name": "egg",
        "quantity": 3,
        "note": "blended"
    }
    ingredient_deleted_name = "egg"
    target_day = go_to_target_day(driver, -11)
    switch_mode(driver, "browse")
    create_meal(driver, meal_type)
    meal = activate_meal(driver, meal_type)
    add_food_to_meal(driver, meal, current_food_name)
    switch_mode(driver, "edit")
    meal_foods = driver.find_element(By.ID, f"meal-foods-{meal_type}")
    navigate_to_food_page(driver, meal_type, current_food_name)
    switch_mode(driver, "browse")
    update_food_name(driver, current_food_name, updated_food_name)
    update_food_description(driver, current_food_description, updated_food_description)
    create_new_ingredient_in_modal(driver, new_ingredient_name, new_ingredient_unit)
    add_ingredient_to_food(driver, new_ingredient_name, new_ingredient_quantity, new_ingredient_note)
    update_ingredient_in_food(driver, existing_ingredient_name, updated_ingredient)
    switch_mode(driver, "edit")
    assert driver.find_element(By.ID, "food-name").text.lower() == updated_food_name, "The updated food name should be displayed under browse mode"
    assert driver.find_element(By.ID, "food-description").text.lower() == updated_food_description.lower(), "The updated food name should be displayed under browse mode"
    assert all(x.lower() in driver.find_element(By.ID, "ingredients-browse").text.lower() for x in [new_ingredient_name, str(new_ingredient_quantity), new_ingredient_note])
    assert all(x.lower() in driver.find_element(By.ID, "ingredients-browse").text.lower() for x in [updated_ingredient["name"], str(updated_ingredient["quantity"]), updated_ingredient["note"]])
    switch_mode(driver, "browse")
    delete_ingredient_from_food(driver, ingredient_deleted_name)
    switch_mode(driver, "edit")
    assert ingredient_deleted_name not in driver.find_element(By.ID, "ingredients-browse").text.lower()



