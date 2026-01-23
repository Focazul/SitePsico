from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Port is 3001 as per server log
    url = "http://localhost:3001/blog"
    print(f"Navigating to {url}")
    try:
        page.goto(url)

        # Wait for network idle to ensure assets are loaded
        page.wait_for_load_state("networkidle")

        # Take a screenshot
        page.screenshot(path="verification/blog_page.png")
        print("Screenshot saved to verification/blog_page.png")

        # Check title
        title = page.title()
        print(f"Page title: {title}")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
