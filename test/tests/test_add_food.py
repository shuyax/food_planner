import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL
import time

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
    save_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-save'))
    )
    assert save_btn.get_attribute("disabled") == "true", "Save button should be disabled when food name is empty"
    cancel_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-back'))
    )
    assert cancel_btn.is_displayed(), "Cancel button should be visible"   


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

def test_add_food_description(driver):
    driver.get(add_food_url)
    food_description_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-description-input'))
    )
    text_to_enter = "How to make strawberry yogurt?"
    food_description_input.send_keys(text_to_enter)
    assert food_description_input.text == text_to_enter, "The description should match what entered"

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
    food_description_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-description-input'))
    )
    food_description_input.send_keys("How to make Tomato Fried Egg?")
    save_btn.click()
    food_name = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-name'))
    )
    assert food_name.text == "TOMATO FRIED EGG", "Food Name should be capitalized"
    food_description = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-description'))
    )
    assert food_description.text == "How to make Tomato Fried Egg?", "Food description should be visible"
    

def test_ingredients_section(driver):
    driver.get(add_food_url)
    food_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-name-input'))
    )
    food_name_input.send_keys("cacao milk")
    save_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'food-save'))
    )
    save_btn.click()
    enable_ingredients_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'enable-ingredients'))
    )
    enable_ingredients_btn.click()
    ingredient_title = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-title'))
    )
    assert ingredient_title.text == 'Ingredients', "Title is missing in the ingredient section"
    add_ingredient_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'add-ingredient'))
    )
    assert add_ingredient_btn.is_displayed(), "Add ingredient to food button is not visible"    
    ingredient_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-0'))
    )
    assert ingredient_select.is_displayed(), "Ingredient select list is not visible"
    select = Select(ingredient_select)
    select.select_by_visible_text("milk") 

    unit_quantity_label = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//label[contains(text(), 'Unit Quantity')]"))
    )
    assert unit_quantity_label.is_displayed(), "unit_quantity_label should be visible"
    assert 'cup' in unit_quantity_label.text, "unit_quantity_label text does not contain 'cup'"
    # test quantity input validation
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
    unit_quantity_input.clear()
    unit_quantity_input.send_keys(4)
    # test add ingredient btn
    ingredient_row_elements = driver.find_elements(By.CLASS_NAME, "ingredient-row")
    prev_row_len = len(ingredient_row_elements)
    add_ingredient_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'add-ingredient'))
    )
    add_ingredient_btn.click()
    ingredient_row_elements = driver.find_elements(By.CLASS_NAME, "ingredient-row")
    middle_row_len = len(ingredient_row_elements)
    assert middle_row_len == prev_row_len + 1, "ingredient-row should be increased by one ingredient-row by clicking the add ingredient button"
    # test remove btn
    new_ingredient_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-1'))
    )
    new_select = Select(new_ingredient_select)
    new_select.select_by_visible_text("tomato") 
    remove_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "remove-btn-1"))
    )
    assert remove_btn.is_displayed(), "remove_btn should be visible"
    remove_btn.click()
    ingredient_row_elements = driver.find_elements(By.CLASS_NAME, "ingredient-row")
    after_row_len = len(ingredient_row_elements)
    assert after_row_len == middle_row_len - 1, "ingredient-row should be deleted by clicking the remove button" 
    # test save btn
    add_ingredient_btn.click()
    new_ingredient_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-1'))
    )
    new_select = Select(new_ingredient_select)
    new_select.select_by_visible_text("cacao powder") 
    new_unit_quantity_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "quantity-1"))
    )
    new_unit_quantity_input.send_keys(3)
    note_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ingredient-note-1"))
    )
    note_input.send_keys("cacao powder should be frozen")
    ingredients_save_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'ingredients-save'))
    )
    ingredients_save_btn.click()
    ingredients_section = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredients-browse'))
    )
    li_children = ingredients_section.find_elements(By.TAG_NAME, "li")
    assert len(li_children) == 2, "The number of ingredients displayed should match the number of ingredients entered"
    assert li_children[1].text.strip() == "CACAO POWDER: 3 tablespoon (tbsp); Note: cacao powder should be frozen", "The text should match the ingredient name, quantity and unit"


def test_back_button(driver):
    driver.get(add_food_url)
    cancel_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'food-back'))
    )
    cancel_btn.click()
    WebDriverWait(driver, 10).until(
        lambda d: "/add-food" not in d.current_url
    )
    assert driver.current_url == BASE_URL + "/", "Back button should navigate back to the home page"


def test_create_ingredient_btn(driver):
    driver.get(add_food_url)
    food_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-name-input'))
    )
    food_name_input.send_keys("strawberry yogurt")
    save_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'food-save'))
    )
    save_btn.click()
    enable_ingredients_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'enable-ingredients'))
    )
    enable_ingredients_btn.click()
    add_ingredient_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'add-ingredient'))
    )
    ingredient_0_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-0'))
    )
    select_0 = Select(ingredient_0_select)
    select_0.select_by_visible_text("yogurt") 
    unit_quantity_input_0 = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "quantity-0"))
    )
    unit_quantity_input_0.clear()
    unit_quantity_input_0.send_keys(3)
    add_ingredient_btn.click()
    ingredient_1_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-1'))
    )
    ingredient_1_options = ingredient_1_select.find_elements(By.TAG_NAME, "option")
    options = []
    for option in ingredient_1_options:
        options.append(option.get_attribute("value"))
    assert "strawberry" not in options, "Strawberry should not be an existing ingredient"
    create_ingredient_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'create-ingredient'))
    )
    create_ingredient_btn.click()
    ingredient_modal = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, 'modal'))
    )
    ingredient_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-name-input'))
    )
    ingredient_name_input.send_keys("strawberry")
    ingredient_unit_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'canonical-unit'))
    )
    Select(ingredient_unit_select).select_by_visible_text("piece (pcs)") 
    modal_save_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'ingredient-save'))
    )
    modal_save_btn.click()
    ingredient_creation_status = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-form-note'))
    )
    assert ingredient_creation_status.text == 'Ingredient strawberry created successfully!', "The ingredient should be created successfully"
    backdrop = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "modal-backdrop"))
    )
    backdrop.click()
    ingredient_1_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-1'))
    )
    ingredient_1_options = ingredient_1_select.find_elements(By.TAG_NAME, "option")
    updated_options = []
    for option in ingredient_1_options:
        updated_options.append(option.get_attribute("value"))
    assert 'strawberry' in updated_options, "Strawberry should be an existing ingredient"
    assert len(updated_options) == len(options) + 1, "Should have one more ingredient option"
    
