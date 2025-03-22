# Jitsu + Google Sheets Integration Guide for Brainware

This guide will help you set up Jitsu (formerly EventNative) to collect application form submissions and send them directly to Google Sheets.

## Step 1: Create a Jitsu Account

1. Go to [Jitsu Cloud](https://jitsu.com/) and sign up for an account or log in
2. Create a new project (e.g., "Brainware Applications")

## Step 2: Configure Your Data Source

1. In your Jitsu dashboard, go to "Sources"
2. Create a new source with the following settings:
   - **Source Type**: JavaScript
   - **Name**: Brainware Application Form
   - **Public Key**: This will be generated for you - copy it

## Step 3: Set Up Google Sheets as a Destination

1. Go to "Destinations" in your Jitsu dashboard
2. Click "Add Destination" 
3. Select "Google Sheets" as the destination type
4. Follow the authentication steps to connect your Google account
5. Create a new Google Sheet or select an existing one
6. Configure the mapping between Jitsu events and Google Sheets columns:
   
   | Jitsu Field           | Google Sheet Column     |
   |-----------------------|-------------------------|
   | event_type            | Event Type              |
   | timestamp             | Timestamp               |
   | name                  | Name                    |
   | email                 | Email                   |
   | country               | Country                 |
   | note                  | Note                    |
   | page_url              | Page URL                |
   | user_agent            | Browser                 |

## Step 4: Update Your Website Configuration

1. Open the `js/jitsu-config.js` file
2. Replace `REPLACE_WITH_YOUR_JITSU_KEY` with the tracking API key you received in Step 2
3. Update the tracking_host if you're using a self-hosted Jitsu instance

```javascript
// Example of a properly configured jitsu-config.js
const jitsu = window.jitsu.createClient({
  tracking_host: 'https://t.jitsu.com', // Or your self-hosted URL
  key: 'js.abcdef123456789...', // Your actual API key
  cookie_domain: window.location.hostname,
});
```

## Step 5: Test Your Integration

1. Open your website and submit a test application
2. Check your Jitsu dashboard to confirm the event was received:
   - Go to "Sources" > "Brainware Application Form" > "Live Events"
   - You should see your test event with all the form data
3. Check your Google Sheet to confirm the data was added
   - It might take a minute or two for the data to propagate

## Step 6: Customize and Extend (Optional)

You can enhance your Jitsu integration:

1. **Add User Identification**:
   ```javascript
   // Add this to track identified users if you have a login system
   jitsu.id({
     id: 'user-unique-id',
     email: 'user@example.com'
   });
   ```

2. **Track Additional Events**:
   ```javascript
   // Track other relevant events
   jitsu.track('page_viewed', { page: window.location.pathname });
   ```

3. **Set Up Additional Destinations**:
   - Jitsu can send your data to multiple destinations simultaneously
   - Consider adding destinations like:
     - BigQuery or Snowflake for advanced analytics
     - Slack for real-time notifications
     - Customer data platforms like Segment

## Troubleshooting

If your data isn't appearing in Google Sheets:

1. Check your browser console for any JavaScript errors
2. Verify events are appearing in the Jitsu Live Events dashboard
3. Confirm your Google Sheets integration is properly authenticated
4. Check that column mappings are correct in Jitsu destination settings

For additional support, visit [Jitsu Documentation](https://jitsu.com/docs).
