import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from conftest import BASE_URL, normalize
import time

add_food_url = f'{BASE_URL}/create-food'
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
        EC.presence_of_element_located((By.ID, 'food-create'))
    )
    assert save_btn.get_attribute("disabled") == "true", "Create button should be disabled when food name is empty"
    assert save_btn.get_attribute("title") == "Create Food", "Create food button should have a title"
    back_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-back'))
    )
    assert back_btn.is_displayed(), "Cancel button should be visible"   
    assert back_btn.get_attribute("title") == "Back to Home Page", "Back button should have a title"


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
        EC.presence_of_element_located((By.ID, 'food-create'))
    )
    assert save_btn.get_attribute("disabled") == 'true', "Create button should be disabled when food name is empty"


def test_add_food_with_whitespace_name(driver):
    driver.get(add_food_url)
    food_name_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-name-input'))
    )
    food_name_input.send_keys(" ")
    save_btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-create'))
    )
    assert save_btn.get_attribute("disabled") == 'true', "Create button should be disabled when food name is whitespace"

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
        EC.presence_of_element_located((By.ID, 'food-create'))
    )
    assert save_btn.is_displayed(), "Save button is not visible"
    assert save_btn.get_attribute("disabled") == 'true', "Create button should be disabled when food name is empty"
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
    toast_message = WebDriverWait(driver, 50).until(
        EC.presence_of_element_located((By.CLASS_NAME, 'toast-message'))
    )
    toast_message_text = toast_message.text.lower()
    assert "" in toast_message_text and "successfully" in toast_message_text and "attach ingredients to the food" in toast_message_text
    WebDriverWait(driver, 30).until(
        lambda d: "/create-food" not in d.current_url
    )
    assert "/food/" in driver.current_url
    food_name = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-name'))
    )
    assert food_name.text == "TOMATO FRIED EGG", "Food Name should be capitalized"
    food_description = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'food-description'))
    )
    assert food_description.text == "How to make Tomato Fried Egg?", "Food description should be visible"
    

def test_back_button(driver):
    driver.get(add_food_url)
    cancel_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, 'food-back'))
    )
    cancel_btn.click()
    WebDriverWait(driver, 10).until(
        lambda d: "/add-food" not in d.current_url
    )
    assert normalize(driver.current_url) == normalize(BASE_URL), "Back button should navigate back to the home page"
