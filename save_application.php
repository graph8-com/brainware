<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $name = isset($_POST['name']) ? htmlspecialchars($_POST['name']) : '';
    $email = isset($_POST['email']) ? htmlspecialchars($_POST['email']) : '';
    $country = isset($_POST['country']) ? htmlspecialchars($_POST['country']) : '';
    $note = isset($_POST['note']) ? htmlspecialchars($_POST['note']) : '';
    
    // Validate input
    $errors = [];
    
    if (empty($name)) {
        $errors[] = "Name is required";
    }
    
    if (empty($email)) {
        $errors[] = "Email is required";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Invalid email format";
    }
    
    if (empty($country)) {
        $errors[] = "Country is required";
    }
    
    // If no errors, save to file
    if (empty($errors)) {
        // Format data
        $timestamp = date('Y-m-d H:i:s');
        $data = "Timestamp: $timestamp\n";
        $data .= "Name: $name\n";
        $data .= "Email: $email\n";
        $data .= "Country: $country\n";
        $data .= "Note: $note\n";
        $data .= "------------------------------------------------------\n\n";
        
        // Save to applications.txt file
        $file = 'applications.txt';
        
        // Append data to the file
        if (file_put_contents($file, $data, FILE_APPEND)) {
            $response = [
                'success' => true,
                'message' => 'Application submitted successfully!'
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'Error saving application. Please try again.'
            ];
        }
    } else {
        $response = [
            'success' => false,
            'message' => 'Please fix the following errors: ' . implode(', ', $errors)
        ];
    }
    
    // Return JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// If accessed directly without POST data
echo "Invalid request";
?>
