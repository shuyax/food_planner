import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL

add_ingredient_url = f'{BASE_URL}/add-ingredient'

def test_add_ingredient_with_related_fields(driver):
    driver.get(add_ingredient_url)
    # Wait for the ingredient name input to appear
    ingredient_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-name-input'))
    )
    assert ingredient_name_input.get_attribute('type') == 'text'
    assert ingredient_name_input.is_displayed(), "Ingredient input is not visible"
    assert ingredient_name_input.get_attribute('type') == 'text', "Ingredient name input type is not correct"

    # Wait for the canonical unit select to appear
    canonical_unit_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'canonical-unit'))
    )
    assert canonical_unit_select.is_displayed(), "Canonical unit select is not visible"
    canonical_unit_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'canonical-unit'))
    )
    save_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-save'))
    )
    assert save_btn.is_displayed(), "Save button is not visible"
    cancel_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-cancel'))
    )
    assert cancel_btn.is_displayed(), "Cancel button is not visible"


def test_add_ingredient_with_uppercase_name(driver):
    driver.get(add_ingredient_url)
    # Wait for the ingredient name input to appear
    ingredient_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-name-input'))
    )
    assert ingredient_name_input.get_attribute('value') == '', "Default value of ingredient_name_input should be empty"
    assert ingredient_name_input.is_displayed(), "Ingredient input is not visible"
    # Interact with the inputs
    ingredient_name_input.send_keys("Tomato")
    ingredient_name_output = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-name-input'))
    )
    assert ingredient_name_output.get_attribute('value') == "tomato", "Ingredient output value doesn't match input"



def test_add_ingredient_with_no_name(driver):
    driver.get(add_ingredient_url)
    # Wait for the ingredient name input to appear
    ingredient_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-name-input'))
    )
    assert ingredient_name_input.is_displayed(), "Ingredient input is not visible"

    # Wait for the canonical unit select to appear
    canonical_unit_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'canonical-unit'))
    )
    assert canonical_unit_select.is_displayed(), "Canonical unit select is not visible"

    # Interact with the inputs
    ingredient_name_input.send_keys("")
    save_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-save'))
    )
    assert save_btn.get_attribute("disabled") == 'true', "Save button should be disabled when ingredient name is empty"


def test_add_ingredient_with_whitespace_name(driver):
    driver.get(add_ingredient_url)
    # Wait for the ingredient name input to appear
    ingredient_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-name-input'))
    )
    assert ingredient_name_input.is_displayed(), "Ingredient input is not visible"
    # Interact with the inputs
    ingredient_name_input.send_keys(" ")
    save_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-save'))
    )
    assert save_btn.get_attribute("disabled") == 'true', "Save button should be disabled when ingredient name is whitespace"
    



def test_add_ingredient_save_btn(driver):
    driver.get(add_ingredient_url)
    # Wait for the ingredient name input to appear
    ingredient_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-name-input'))
    )
    ingredient_name_input.get_attribute('type') == 'text'
    assert ingredient_name_input.is_displayed(), "Ingredient input is not visible"

    save_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-save'))
    )
    assert save_btn.get_attribute("disabled") == 'true', "Save button should be disabled when ingredient name is empty"

    # Interact with the inputs
    ingredient_name_input.send_keys("Tomato")
    ingredient_name_output = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'ingredient-name-input'))
    )
    assert save_btn.get_attribute("disabled") == None, "Save button should be enabled when ingredient name is not empty"


def  test_add_ingredient_unit_select(driver):
    driver.get(add_ingredient_url)
    # Wait for the canonical unit select to appear
    canonical_unit_select = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'canonical-unit'))
    )
    assert canonical_unit_select.is_displayed(), "Canonical unit select is not visible"
    ingredient_form_element = driver.find_elements(By.CLASS_NAME, 'ingredient-form')[0]
    optgroup_elements = ingredient_form_element.find_elements(By.TAG_NAME, "optgroup")
    assert len(optgroup_elements) == 3, "unit type optgroup_elements are not correct"
    option_elements = ingredient_form_element.find_elements(By.TAG_NAME, "option")
    assert len(option_elements) == 17, "unit options are not correct"

    # Use Select class to choose an option
    select = Select(canonical_unit_select)
    select.select_by_visible_text("piece (pcs)") 
    assert canonical_unit_select.get_attribute("value") == "piece"
