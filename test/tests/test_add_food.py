import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL

add_food_url = f'{BASE_URL}/add-food'
def test_add_food_with_related_fields(driver):
    driver.get(add_food_url)
    food_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-name-input'))
    )
    assert food_name_input.is_displayed(), "Food name input is not visible"
    assert food_name_input.get_attribute('type') == 'text', "Food name input type is not correct"
    food_description_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-description-input'))
    )
    assert food_description_input.is_displayed(), "Food description input is not visible"
    assert food_description_input.get_attribute('type') == 'textarea', "Food description input type is not correct"
    ingredient_title = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, 'h2'))
    )
    assert ingredient_title.text == 'Ingredients', "Title is missing in the ingredient section"
    ingredient_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, 'select'))
    )
    assert ingredient_select.is_displayed(), "Ingredient select list is not visible"
    assert ingredient_select.get_attribute('value') == "", "The default value of ingredient select list is not null"
    ingredients_section = WebDriverWait(driver, 10).until( 
        EC.presence_of_element_located((By.ID, "ingredients-section")) 
    )
    ingredient_select_elements = ingredients_section.find_elements(By.TAG_NAME, "select")
    assert len(ingredient_select_elements) == 1, "More than one ingredient select list shown up by default"
    unit_quantity_input_elements = ingredients_section.find_elements(By.TAG_NAME, "input")
    assert len(unit_quantity_input_elements) == 0, "Should not have unit_quantity_input by default"
    add_ingredient_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'add-ingredient'))
    )
    assert add_ingredient_btn.is_displayed(), "Add ingredient to food button is not visible"    
    save_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-save'))
    )
    assert save_btn.is_displayed(), "Save button is not visible"
    cancel_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-cancel'))
    )
    assert cancel_btn.is_displayed(), "Cancel button is not visible"   


def test_add_food_with_uppercase_name(driver):
    driver.get(add_food_url)
    food_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-name-input'))
    )
    assert food_name_input.get_attribute('value') == '', "Default value of food_name_input should be empty"
    food_name_input.send_keys("Tomato Fried Egg")
    assert food_name_input.get_attribute('value') == 'tomato fried egg', "output value doesn't match input or output value is not lower cased"


def test_add_food_with_no_name(driver):
    driver.get(add_food_url)
    food_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-name-input'))
    )
    food_name_input.send_keys("")
    save_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-save'))
    )
    assert save_btn.get_attribute("disabled") == 'true', "Save button should be disabled when food name is empty"


def test_add_food_with_whitespace_name(driver):
    driver.get(add_food_url)
    food_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-name-input'))
    )
    food_name_input.send_keys(" ")
    save_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-save'))
    )
    assert save_btn.get_attribute("disabled") == 'true', "Save button should be disabled when food name is whitespace"


def test_add_food_save_btn(driver):

    driver.get(add_food_url)
    save_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-save'))
    )
    assert save_btn.is_displayed(), "Save button is not visible"
    assert save_btn.get_attribute("disabled") == 'true', "Save button should be disabled when food name is empty"
    food_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-name-input'))
    )
    food_name_input.send_keys("Tomato Fried Egg")
    assert save_btn.get_attribute("disabled") == None, "Save button should be enabled when food name is not empty"

def test_ingredient_select(driver):
    driver.get(add_food_url)
    ingredient_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, 'select'))
    )
    select = Select(ingredient_select)
    select.select_by_visible_text("tomato") 
    assert ingredient_select.get_attribute("value") == "tomato"
    unit_quantity_label = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//label[contains(text(), 'Unit Quantity')]"))
    )
    assert unit_quantity_label.is_displayed(), "unit_quantity_label should be visible"
    assert 'piece (pcs)' in unit_quantity_label.text, "unit_quantity_label text does not contain 'piece (pcs)'"
    unit_quantity_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "quantity-0"))
    )
    assert unit_quantity_input.get_attribute('type') == 'number', "The type of unit_quantity_input is not number"
    assert unit_quantity_input.get_attribute('value') == '0', "The default value of unit_quantity_input should be 0"
    unit_quantity_input.clear()
    unit_quantity_input.send_keys(5.5)
    assert unit_quantity_input.get_attribute('value') == '5.5', "The value of unit_quantity_input does not show the correct number"
    unit_quantity_input.clear()
    unit_quantity_input.send_keys('tomato')
    assert unit_quantity_input.get_attribute('value') in ['', '0'], "Invalid value should fallback to default"

def test_add_ingredient_btn(driver):
    driver.get(add_food_url)
    ingredient_row_elements = driver.find_elements(By.CLASS_NAME, "ingredient-row")
    prev_row_len = len(ingredient_row_elements)
    add_ingredient_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'add-ingredient'))
    )
    add_ingredient_btn.click()
    ingredient_row_elements = driver.find_elements(By.CLASS_NAME, "ingredient-row")
    assert len(ingredient_row_elements) == prev_row_len + 1, "ingredient-row should be increased by one ingredient-row by clicking the add ingredient button"


def test_ingredient_remove_btn(driver):
    driver.get(add_food_url)
    ingredient_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, 'select'))
    )
    select = Select(ingredient_select)
    select.select_by_visible_text("tomato") 
    assert ingredient_select.get_attribute("value") == "tomato"
    remove_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "remove-btn"))
    )
    assert remove_btn.is_displayed(), "remove_btn should be visible"
    remove_btn.click()
    ingredient_row_elements = driver.find_elements(By.CLASS_NAME, "ingredient-row")
    assert len(ingredient_row_elements) == 0, "ingredient-row should be deleted by clicking the remove button" 

# def test_ingredient_remove_btn_with_remove_specific_row(driver):
#     try:
#         driver.get(add_food_url)
#         ingredient_select_1 = WebDriverWait(driver, 10).until(
#             EC.presence_of_element_located((By.ID, 'ingredient-0'))
#         )
#         select_1 = Select(ingredient_select)
#         select_1.select_by_visible_text("tomato") 
#         assert ingredient_select_1.get_attribute("value") == "tomato"

#         ingredient_select_2 = WebDriverWait(driver, 10).until(
#             EC.presence_of_element_located((By.ID, 'ingredient-1'))
#         )
#         select_2 = Select(ingredient_select)
#         select_2.select_by_visible_text("cheese") 
#         assert ingredient_select_2.get_attribute("value") == "cheese"
#         remove_btn = WebDriverWait(driver, 10).until(
#             EC.presence_of_element_located((By.CLASS_NAME, "remove-btn"))
#         )[0]
#         remove_btn.click()
#         ingredient_row_elements = driver.find_elements(By.CLASS_NAME, "ingredient-row")
#         assert len(ingredient_row_elements) == 1, "Should only have one ingredient row left"
#         ingredient_row_element = ingredient_row_elements[0]
#         ingredient_select_elements = ingredient_row_element.find_elements(By.TAG_NAME, 'select')
#         assert len(ingredient_select_elements) == 1, "Should only have one ingredient select element left"
#         ingredient_select = ingredient_select_elements[0]
#         assert ingredient_select.get_attribute("value") == "cheese"
#     except Exception as e:
#         print(f"❌: {e}")