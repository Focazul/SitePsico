from playwright.sync_api import sync_playwright

def verify_blog():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to blog
        print("Navigating to /blog...")
        page.goto("http://localhost:5173/blog")

        # Wait for posts to load (if any)
        # Check for "Blog" title
        try:
            page.wait_for_selector("h1:text('Blog')", timeout=10000)
            print("Blog title found.")
        except:
            print("Blog title NOT found.")

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/blog.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_blog()
