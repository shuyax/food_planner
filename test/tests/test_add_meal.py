import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from conftest import BASE_URL
from datetime import date
import time

get_target_date = '2026-01-16'
delete_target_date = '2026-01-07'
post_target_date = '2026-01-06'
put_target_date = '2026-01-08'
get_add_meal_url = f'{BASE_URL}/day-meals?date={get_target_date}'
delete_add_meal_url = f'{BASE_URL}/day-meals?date={delete_target_date}'
post_add_meal_url = f'{BASE_URL}/day-meals?date={post_target_date}'
put_add_meal_url = f'{BASE_URL}/day-meals?date={put_target_date}'

def test_add_meal_with_related_fields(driver):
    driver.get(get_add_meal_url)
    edit_day_meals_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "day-meals-edit"))
    )
    day_meals_checkmark = driver.find_elements(By.ID, "day-meals-checkmark")
    assert len(day_meals_checkmark) == 0, "day_meals_checkmark should not exist under browse mode"
    dinner_meal_section =  WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "meal-section-dinner"))
    )
    dinner_meal_section.click()
    select_elements = driver.find_elements(By.TAG_NAME, "select")
    assert len(select_elements) == 0, "Foods should not be displayed as select and add meal select should not exist under browse mode"
    edit_day_meals_btn.click()
    meal_form_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, 'meal-form'))
    )
    date_element = meal_form_element.find_element(By.ID, "meal-date")
    assert date_element.text == get_target_date, "The date displayed should match the date get from url"
    day_cell_element = meal_form_element.find_element(By.ID, "day-cell")
    assert day_cell_element.is_displayed(), "Day cell should be visible"
    meal_section_elements = day_cell_element.find_elements(By.CLASS_NAME, "meal-section")
    assert len(meal_section_elements) == 1, "The should be only one meal on the get_target_date"
    assert meal_section_elements[0].get_attribute("id") == "meal-section-dinner", "The meal section id should include the meal type"
    assert "DINNER" in meal_section_elements[0].text, "The meal type should be visible and capitalized in meal section"
    meal_foods_elements = day_cell_element.find_element(By.ID,"meal-foods-dinner")
    meal_food_elements = meal_foods_elements.find_elements(By.CLASS_NAME, "meal-food")
    assert len(meal_food_elements) == 1, "There should be only one food on the dinner meal on the get_target_date"
    assert meal_food_elements[0].get_attribute("id") == "dinner-stir fry bok choy" and meal_food_elements[0].text == "Stir Fry Bok Choy", "The food should be stir fry bok choy"
    # test meal type select element exists and populated correctly
    meal_type_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'meal-type'))
    )
    assert meal_type_element.is_displayed(), "Meal type select should be visible"
    option_elements = meal_type_element.find_elements(By.TAG_NAME, "option")
    assert len(option_elements) == 6, "There should be 5 meal types and and empty option populated under select"
    assert meal_type_element.find_element(By.XPATH, "./*[1]").text.lower() == '-- select a meal type --', "The first option should be a default option"
    assert meal_type_element.find_element(By.XPATH, "./*[1]").get_attribute('value') == '', "The first option should have an empty value"
    assert meal_type_element.get_attribute('value') == '', "The select element should have an empty value by default"
    day_meals_checkmark = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "day-meals-checkmark"))
    )
    edit_day_meals_btn = driver.find_elements(By.ID, "day-meals-edit")
    assert len(edit_day_meals_btn) == 0, "Edit day meals button should not exist under edit mode"

def test_active_meal_with_related_fields(driver):
    driver.get(get_add_meal_url)
    edit_day_meals_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "day-meals-edit"))
    )
    edit_day_meals_btn.click()
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'day-cell'))
    )
    target_active_meal = driver.find_elements(By.ID, "meal-section-dinner")
    assert len(target_active_meal) == 1, "There should be only one dinner"
    target_active_meal = target_active_meal[0]
    hiden_elements_ids = ['meal-delete-btn-dinner', 'food-add-btn-dinner']
    hiden_elements_class_names = ['food-delete-btn', 'food-list-select']
    for hiden_elements_id in hiden_elements_ids:
        elements = target_active_meal.find_elements(By.ID, hiden_elements_id)
        assert len(elements) == 0, f"{hiden_elements_id} should not be visible"
    for hiden_elements_class_name in hiden_elements_class_names:
        elements = target_active_meal.find_elements(By.CLASS_NAME, hiden_elements_class_name)
        assert len(elements) == 0, f"{hiden_elements_class_name} should not exist"
    target_active_meal.click()
    target_active_meal = driver.find_element(By.ID, "meal-section-dinner")
    for hiden_elements_id in hiden_elements_ids:
        elements = target_active_meal.find_elements(By.ID, hiden_elements_id)
        assert len(elements) == 1, f"{hiden_elements_id} should be visible"
    for hiden_elements_class_name in hiden_elements_class_names:
        elements = target_active_meal.find_elements(By.CLASS_NAME, hiden_elements_class_name)
        assert len(elements) == 1, f"the number of {hiden_elements_class_name} should match the number of food in the active meal"
        if elements[0].tag_name == 'select':
            assert elements[0].get_attribute("value") != '', "The value of the select should not be the default empty value"
            options = elements[0].find_elements(By.TAG_NAME, "option")
            assert len(options) > 1, "There should be more than one food listed as options"

def test_add_meal(driver):
    driver.get(post_add_meal_url)
    edit_day_meals_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "day-meals-edit"))
    )
    edit_day_meals_btn.click()
    meal_type_list = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'meal-type'))
    )
    meal_section_elements = driver.find_elements(By.CLASS_NAME, 'meal-section')
    len_before_add = len(meal_section_elements)
    assert len_before_add == 1, "There should be only one meal type on the target day"
    select = Select(meal_type_list)
    select.select_by_visible_text("dinner")
    # Wait for the DOM to update (length should stay the same for duplicate)
    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.ID, 'meal-type-list-'))
    )
    meal_section_elements_v_1 = driver.find_elements(By.CLASS_NAME, 'meal-section')
    assert len(meal_section_elements_v_1) == len_before_add, "The meal type section should not increase for a duplicate"
    # Add a new meal (breakfast)
    meal_type_list = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'meal-type'))
    )
    select = Select(meal_type_list)
    select.select_by_visible_text("breakfast")
    # Wait until the new meal section appears (length increases)
    WebDriverWait(driver, 10).until(
        lambda d: len(
            d.find_elements(By.CLASS_NAME, "meal-section")
        ) == len_before_add + 1
    )
    meal_section_elements_v_2 = driver.find_elements(By.CLASS_NAME, 'meal-section')
    assert len(meal_section_elements_v_2) == len_before_add + 1, "The meal type section should increase by one for a new meal type"
    # Verify the new meal type text
    new_meal_type = driver.find_element(By.ID, 'meal-section-breakfast')
    assert new_meal_type is not None, "The new meal type should be visible"

def test_delete_meal_button(driver):
    driver.get(delete_add_meal_url)
    edit_day_meals_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "day-meals-edit"))
    )
    edit_day_meals_btn.click()
    meal_section_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "meal-section-dinner"))
    )
    meal_section_btn.click()
    delete_meal_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "meal-delete-btn-dinner"))
    )
    delete_meal_btn.click()
    WebDriverWait(driver, 10).until(
        EC.invisibility_of_element_located((By.ID, 'meal-delete-btn-dinner'))
    )
    deleted_meal_section = driver.find_elements(By.ID, "meal-delete-btn-dinner")
    assert len(deleted_meal_section) == 0, "The meal section deleted should not be visible"
    
def test_add_food_section(driver):
    driver.get(post_add_meal_url)
    edit_day_meals_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "day-meals-edit"))
    )
    edit_day_meals_btn.click()
    meal_type_list = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'meal-type'))
    )
    meal_section_elements = driver.find_elements(By.CLASS_NAME, 'meal-section')
    len_before_add = len(meal_section_elements)
    select = Select(meal_type_list)
    select.select_by_visible_text("drink")
    WebDriverWait(driver, 10).until(
        lambda d: len(d.find_elements(By.CLASS_NAME, "meal-section")) == len_before_add + 1
    )
    meal_section_drink_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "meal-section-drink"))
    )
    meal_section_dinner_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "meal-section-dinner"))
    )
    meal_section_dinner_btn.click()
    # test add food button
    add_food_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'food-add-btn-dinner'))
    )
    add_food_btn.click()
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'dinner--1'))
    )
    new_food_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'dinner-'))
    )
    assert new_food_select.get_attribute("value") == "", "The value of new select should be empty"
    assert add_food_btn.get_attribute("disabled") is not None, "The add food button should be disabled if there is an empty select"
    food_select = Select(new_food_select)
    food_select.select_by_visible_text("tomato beef udon with cheese")
    add_food_btn = WebDriverWait(driver, 20).until(
        EC.element_to_be_clickable((By.ID, 'food-add-btn-dinner'))
    )
    assert add_food_btn.get_attribute("disabled") is None, "The add food button should be enable if there is no empty select"
    meal_section_drink_btn.click()
    new_added_food = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'dinner-tomato beef udon with cheese'))
    )
    assert new_added_food.is_displayed(), "The newly added food should be visible"
    assert new_added_food.tag_name == "li", "The newly added food should be under li after switch editing meal"
    
    # test foods currently added to the current meal are not options of select
    meal_foods_dinner = driver.find_element(By.ID, "meal-foods-dinner")
    current_foods_li = meal_foods_dinner.find_elements(By.CLASS_NAME, "meal-food")
    name_of_foods = [li.text for li in current_foods_li]
    meal_section_dinner_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "meal-section-dinner"))
    )
    meal_section_dinner_btn.click()
    add_food_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'food-add-btn-dinner'))
    )
    add_food_btn.click()
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'dinner--1'))
    )
    new_food_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'dinner-'))
    )
    available_options = new_food_select.find_elements(By.TAG_NAME, "option")
    available_option_names = [option.get_attribute("value") for option in available_options]
    assert name_of_foods not in available_option_names
    # test default food will be filter out after saving
    meal_section_dinner_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "meal-section-dinner"))
    )
    lis = meal_section_dinner_btn.find_elements(By.CLASS_NAME, "meal-food-edit")
    filtered_lis = [li for li in lis if "--1" not in li.get_attribute("id")]
    valid_li_len = len(filtered_lis)
    meal_section_drink_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "meal-section-drink"))
    )
    meal_section_drink_btn.click()
    meal_foods_dinner = driver.find_element(By.ID, "meal-foods-dinner")
    displayed_lis = meal_foods_dinner.find_elements(By.CLASS_NAME, "meal-food")
    assert len(displayed_lis) == valid_li_len, "default food with foodId -1 should be filter out after saving"

def test_delete_food_section(driver):
    driver.get(delete_add_meal_url)
    edit_day_meals_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "day-meals-edit"))
    )
    edit_day_meals_btn.click()
    meal_section_lunch_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "meal-section-lunch"))
    )
    meal_section_lunch_btn.click()
    food = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'lunch-8'))
    )
    assert food.is_displayed(), "The food to be deleted should exist"
    food_delete_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "food-delete-btn-lunch-8"))
    )
    food_delete_btn.click()
    # refresh the page
    driver.get(delete_add_meal_url)
    meal_section_lunch_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "meal-section-lunch"))
    )
    deleted_food = meal_section_lunch_btn.find_elements(By.ID, 'lunch-8')
    assert len(deleted_food) == 0, "The deleted food should not exist"

    
def test_update_food_to_existing_meal(driver):
    driver.get(put_add_meal_url)
    edit_day_meals_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "day-meals-edit"))
    )
    edit_day_meals_btn.click()
    meal_section_lunch_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "meal-section-lunch"))
    )
    meal_section_lunch_btn.click()
    current_food_select = driver.find_element(By.ID, "lunch-stir fry bok choy")
    select = Select(current_food_select)
    select.select_by_visible_text("spicy sour noodle")
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'lunch-spicy sour noodle'))
    )
    new_food = driver.find_elements(By.ID, "lunch-spicy sour noodle")
    assert len(new_food) == 1, "The new food should be visible"
    # refresh the page
    driver.get(put_add_meal_url)
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'lunch-spicy sour noodle'))
    )
    new_food = driver.find_elements(By.ID, "lunch-spicy sour noodle")
    assert len(new_food) == 1, "The new food should be still visible after refresh the page"
    