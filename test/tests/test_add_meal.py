import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL
from datetime import date

target_date = '2026-01-06'
add_meal_url = f'{BASE_URL}/add-meal?date={target_date}'

def test_add_meal_with_related_fields(driver):
    driver.get(add_meal_url)
    # test the calendar section displayed correctly with related data
    meal_form_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, 'meal-form'))
    )
    first_child = meal_form_element.find_element(By.XPATH, "./*[1]")
    assert first_child.get_attribute("class") == "fc fc-media-screen fc-direction-ltr fc-theme-standard", "The first element in a meal-form should be the calendar"
    event_main_element = first_child.find_elements(By.CLASS_NAME, "fc-event-main")
    assert len(event_main_element) == 1, "There should be only one meal displayed on the target day"
    children = event_main_element[0].find_elements(By.XPATH, "./*")
    assert len(children) == 2, "There should be two children under the event"
    assert children[0].tag_name == "strong", "The first child should be <strong>"
    assert children[0].text == "DINNER", "The first child should be DINNER"
    assert children[1].text == "stir fry bok choy", "The second child should be food name"
    # test meal type select element exists and populated correctly
    meal_type_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'meal-type-0'))
    )
    assert meal_type_element.is_displayed(), "Meal type select should be visible"
    option_elements = meal_type_element.find_elements(By.TAG_NAME, "option")
    assert len(option_elements) == 6, "There should be 5 meal types and and empty option populated under select"
    assert meal_type_element.find_element(By.XPATH, "./*[1]").text == '-- Select a meal type --', "The first option should be a default option"
    assert meal_type_element.find_element(By.XPATH, "./*[1]").get_attribute('value') == '', "The first option should have an empty value"
    assert meal_type_element.get_attribute('value') == '', "The select element should have an empty value by default"
    # test food select element exists and populated correctly
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, 'food-list'))
    )
    food_elements = driver.find_elements(By.CLASS_NAME, 'food-list')
    assert len(food_elements) > 0, "There should be at least one food list"
    food_children = food_elements[0].find_elements(By.XPATH, "./*")
    assert len(food_children) == 0, "There should be no child under food-list by default"
   
def test_select_meal_type(driver):
    driver.get(add_meal_url)
    meal_type_select_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'meal-type-0'))
    )
    select = Select(meal_type_select_element)
    select.select_by_visible_text("lunch")
    assert meal_type_select_element.get_attribute("value") == "lunch", "The selected option value should be the select value"

def test_add_food_section(driver):
    driver.get(add_meal_url)
    # Add food button is not visible when meal type is empty
    meal_type_select_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'meal-type-0'))
    )
    select = Select(meal_type_select_element)
    select.select_by_visible_text("lunch")
    # test add food button
    add_food_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'add-food'))
    )
    food_list_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, 'ol'))
    )
    food_elements = food_list_element.find_elements(By.TAG_NAME, "li")
    assert len(food_elements) == 0, "There should be no food select by default"
    add_food_btn.click()
    # test food select
    li_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, 'li'))
    )
    food_elements = food_list_element.find_elements(By.TAG_NAME, "li")
    assert len(food_elements) == 1, "The number of food select should be increased by one after clicking the add food button"
    food_select_elements = food_elements[0].find_elements(By.TAG_NAME, "select")
    select = Select(food_select_elements[0])
    select.select_by_visible_text("taro milk tea")
    assert food_select_elements[0].get_attribute("value") == "taro milk tea", "The selected option value should be the food select value"
    # test remove food button
    remove_btn = li_element.find_elements(By.CLASS_NAME, "remove-food-btn")[0]
    remove_btn.click()
    food_elements = food_list_element.find_elements(By.TAG_NAME, "li")
    assert len(food_elements) == 0, "The number of food select should be decreased by one after clicking the remove food button"

def test_add_meal_button(driver):
    driver.get(add_meal_url)
    add_meal_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'add-meal'))
    )
    meal_row_elements = driver.find_elements(By.CLASS_NAME, "meal-row")
    assert len(meal_row_elements) == 1, "The number of meal row should be one by default"
    add_meal_btn.click()
    meal_row_elements = driver.find_elements(By.CLASS_NAME, "meal-row")
    assert len(meal_row_elements) == 2, "The number of meal row should be increased by one after clicking the add meal button"

def test_delete_meal_button(driver):
    driver.get(add_meal_url)
    add_meal_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'add-meal'))
    )
    add_meal_btn.click()
    meal_row_elements = driver.find_elements(By.CLASS_NAME, "meal-row")
    current_meal_row = len(meal_row_elements)
    delete_meal_btn = meal_row_elements[0].find_elements(By.CLASS_NAME, "remove-meal-btn")
    assert len(delete_meal_btn) == 1, "There should be only one delete meal button per meal"
    delete_meal_btn[0].click()
    meal_row_elements = driver.find_elements(By.CLASS_NAME, "meal-row")
    assert len(meal_row_elements) == current_meal_row - 1, "delete meal button should make the meal row decrease by one"

def test_save_button(driver):
    new_add_meal_url = f'{BASE_URL}/add-meal?date={date.today().isoformat()}'
    driver.get(new_add_meal_url)
    meal_type_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'meal-type-0'))
    )
    select = Select(meal_type_select)
    select.select_by_visible_text("drink")
    add_food_button = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'add-food'))
    )
    add_food_button.click()
    food_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-0-0'))
    )
    select_food = Select(food_select)
    select_food.select_by_visible_text("taro milk tea")
    save_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'meal-save'))
    )
    save_btn.click()
    food_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.XPATH, "//div[text()='taro milk tea']")
        )
    )
    assert food_element.is_displayed(), "The new meal added should be visible on calendar"
    preceding_strong = food_element.find_element(
        By.XPATH, "preceding-sibling::strong[1]"
    )
    assert preceding_strong.text.lower() == "drink", "The new meal added should be under drink"
    assert meal_type_select.get_attribute("value") == '', "the value of meal type select should be back to empty after successful submission"
    try:
        WebDriverWait(driver, 10).until(
            EC.invisibility_of_element_located((By.ID, "add-food"))
        )
        # If reachs here, the button is gone
        assert True
    except TimeoutException:
        # The button is still visible after 10 seconds
        assert False, "add-food button should disappear"
