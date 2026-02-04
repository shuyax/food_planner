import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL
from datetime import date
import time

food_id = 7
edit_food_url = f'{BASE_URL}/edit-food/{food_id}'


def test_edit_food_with_related_fields(driver):
    driver.get(edit_food_url)
    edit_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'edit-food'))
    )
    edit_btn.click()
    food_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'edit-food-name'))
    )
    assert food_name_input.get_attribute('type') == 'text', "Food name input type is not correct"
    assert food_name_input.get_attribute('value') == 'stir fry zucchini spam egg', "Food name should be loaded"
    food_description_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'edit-food-description'))
    )
    assert food_description_input.get_attribute('type') == 'textarea', "Food description input type is not correct"
    assert "Heat a pan or wok on medium-high" in food_description_input.text, "Food description should be loaded"
    ingredient_rows = driver.find_elements(By.CLASS_NAME, "ingredient-row")
    assert len(ingredient_rows) == 3, "Three ingredients should be loaded"
    ingredient_row_1 = ingredient_rows[0]
    select_1 = ingredient_row_1.find_element(By.ID, 'ingredient-0')
    assert select_1.get_attribute("value") == 'egg', "The ingredient name should be loaded correctly"
    input_1 = ingredient_row_1.find_element(By.ID, 'quantity-0')
    assert input_1.get_attribute("value") == "2", "The ingredient quantity should be loaded correctly"
    quantity_unit_1 = ingredient_row_1.find_element(By.ID, 'quantity-unit-0')
    assert quantity_unit_1.text == 'pcs', "The ingredient quantity unit should be loaded correctly"
    note_1 = ingredient_row_1.find_element(By.ID, 'ingredient-note-0')
    assert note_1.text == "beaten eggs", "The ingredient note should be loaded correctly"
    remove_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'remove-btn-0'))
    )
    assert remove_btn.is_displayed(), "remove button should be visible"
    add_ingredient_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'add-ingredient'))
    )
    assert add_ingredient_btn.is_displayed(), "add ingredient button should be visible"
    create_ingredient_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'create-ingredient'))
    )
    assert create_ingredient_btn.is_displayed(), "create ingredient button should be visible"
    save_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'save-food'))
    )
    assert save_btn.is_displayed(), "save button should be visible"
    back_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'food-back'))
    )
    assert back_btn.is_displayed(), "back button should be visible"

def test_remove_btn(driver):
    driver.get(edit_food_url)
    edit_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'edit-food'))
    )
    edit_btn.click()
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "ingredient-row"))
    )
    ingredient_rows = driver.find_elements(By.CLASS_NAME, "ingredient-row")
    row_len_before = len(ingredient_rows)
    remove_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'remove-btn-0'))
    )
    remove_btn.click()
    time.sleep(5)
    ingredient_rows = driver.find_elements(By.CLASS_NAME, "ingredient-row")
    row_len_after = len(ingredient_rows)
    assert row_len_after == row_len_before - 1, "The number of ingredient rows should be decreased by one"

def test_add_ingredient_btn(driver):
    driver.get(edit_food_url)
    edit_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'edit-food'))
    )
    edit_btn.click()
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "ingredient-row"))
    )
    ingredient_rows = driver.find_elements(By.CLASS_NAME, "ingredient-row")
    row_len_before = len(ingredient_rows)
    add_ingredient_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'add-ingredient'))
    )
    add_ingredient_btn.click()
    time.sleep(5)
    ingredient_rows = driver.find_elements(By.CLASS_NAME, "ingredient-row")
    row_len_after = len(ingredient_rows)
    assert row_len_after == row_len_before + 1, "The number of ingredient rows should be increased by one"

def test_create_ingredient_btn(driver):
    driver.get(edit_food_url)
    edit_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'edit-food'))
    )
    edit_btn.click()
    create_ingredient_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'create-ingredient'))
    )
    create_ingredient_btn.click()
    modal_backdrop = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "modal-backdrop"))
    ) 
    assert modal_backdrop.is_displayed(), "modal_backdrop should be visible"
    modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "modal"))
    ) 
    assert modal.is_displayed(), "modal should be visible"
    ingredient_name = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ingredient-name-input"))
    ) 
    ingredient_name.send_keys("garlic")
    ingredient_unit = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "canonical-unit"))
    ) 
    ingredient_unit_select = Select(ingredient_unit)
    ingredient_unit_select.select_by_visible_text("tablespoon (tbsp)") 
    ingredient_save_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'ingredient-save'))
    )
    ingredient_save_btn.click()
    submission_note = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ingredient-form-note"))
    )
    assert "created successfully" in submission_note.text

def test_back_button(driver):
    driver.get(edit_food_url)
    cancel_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'food-back'))
    )
    cancel_btn.click()
    WebDriverWait(driver, 10).until(
        lambda d: "/edit-food" not in d.current_url
    )
    assert driver.current_url == BASE_URL + "/", "Back button should navigate back to the home page"

def test_save_btn(driver):
    driver.get(edit_food_url)
    edit_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'edit-food'))
    )
    edit_btn.click()
    # update food name
    food_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'edit-food-name'))
    )
    food_name_before = food_name_input.get_attribute('value')
    food_name_input.send_keys("%")
    # update food description
    food_description_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'edit-food-description'))
    )
    food_description_before = food_description_input.text
    food_description_input.send_keys("%")
    # update ingredient 
    ingredient_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-0'))
    )
    initial_select_value = ingredient_select.get_attribute("value")
    assert initial_select_value != "yuanxian big glass noodle", "initial ingredient and updated ingredient should not be same"
    select = Select(ingredient_select)
    select.select_by_visible_text("yuanxian big glass noodle")
    # update ingredient quantity
    quantity_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'quantity-0'))
    )
    initial_quantity = quantity_input.get_attribute("value")
    assert initial_quantity != "3", "initial quantity and updated quantity should not be same"
    quantity_input.send_keys(3)
    # update ingredient note
    note = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-note-0'))
    )
    initial_note = note.text
    assert "#" not in initial_note, "The new string added to note should not have already existed"
    new_note = initial_note + "#"
    note.send_keys(new_note)

    save_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'save-food'))
    )
    save_btn.click()
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ingredients-browse"))
    )
    driver.get(edit_food_url)
    food_name = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-name'))
    )
    assert "%" in food_name.text
    food_description = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-description'))
    )
    assert "%" in food_description.text
    ingredients_browse = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredients-browse'))
    )
    ingredients_li = ingredients_browse.find_elements(By.TAG_NAME, "li")
    assert "yuanxian big glass noodle" in ingredients_li[1].text.lower(), "The new ingredient should be shown"
    assert " 3 pcs" in ingredients_li[1].text.lower(), "The new ingredient quantity and unit should be shown"
    assert "note: #" in ingredients_li[1].text.lower(), "The new note should be shown"
    edit_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'edit-food'))
    )
    edit_btn.is_displayed(), "Edit button should be visible"