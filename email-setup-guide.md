# Email Setup Guide for Brainware Form Submissions

This guide will help you set up the email functionality for the Brainware website's application form to send submissions directly to thomas@brainware.io.

## Step 1: Create an EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/) and sign up for a free account
2. The free plan allows you to send up to 200 emails per month, which should be sufficient for your application form

## Step 2: Add an Email Service

1. After signing in, go to the "Email Services" tab
2. Click "Add New Service"
3. Choose an email service provider (Gmail is a good option for simplicity)
4. Follow the authentication steps to connect your email account
5. Name your service something like "brainware_service"
6. Note the **Service ID** (you'll need this later)

## Step 3: Create an Email Template

1. Go to the "Email Templates" tab
2. Click "Create New Template"
3. Design your template with the following fields:
   - **To email**: {{to_email}} (This will be populated with thomas@brainware.io)
   - **From name**: {{from_name}} (This will be populated with the applicant's name)
   - **Reply-to**: {{reply_to}} (This will be populated with the applicant's email for easy replies)
   - **Subject**: {{subject}} (This will be "New Brainware Founder Application")
   - **Message**: {{message}} (This will contain all the form details)
4. Name your template "brainware_application"
5. Note the **Template ID** (you'll need this later)

## Step 4: Get Your Public Key

1. Go to the "Account" tab
2. Find your "Public Key" and copy it

## Step 5: Update Your Code

Open the `js/application-modal.js` file and make the following changes:

1. Replace `"YOUR_PUBLIC_KEY"` with your actual public key:
```javascript
emailjs.init("your_actual_public_key");
```

2. Update the email sending code with your service ID and template ID:
```javascript
emailjs.send('your_service_id', 'your_template_id', emailParams)
```

## Testing the Form

1. Submit a test application on your website
2. Check if you receive the email at thomas@brainware.io
3. If you don't receive an email, check the browser console for any errors

## Troubleshooting

- If emails aren't being sent, verify your EmailJS account is active
- Make sure your service is properly connected
- Check that the template parameters match exactly what's in your code
- Verify the browser console for any JavaScript errors

---

For any further assistance, refer to the [EmailJS Documentation](https://www.emailjs.com/docs/).
