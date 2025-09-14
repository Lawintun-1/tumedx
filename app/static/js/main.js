
function submitSessionForm() {
    // Collect data from your HTML form fields
    const courseId = document.getElementById('course-id').value;
    const sessionTitle = document.getElementById('session-title').value;
    const sessionType = document.getElementById('session-type').value;
    

    // This is a simplified way to get materials.
    // In your UI, you would have a more complex way to gather these.
    // This assumes you have a list of material objects.
    const materials = [
        {
            title: 'Introduction Text',
            type: 'text',
            content: 'This is the introductory text for the session.'
        },
        {
            title: 'Relational Model Diagram',
            type: 'image',
            content: 'https://example.com/images/relational_model.png'
        }
    ];

    // Create a single data object to send as JSON
    const payload = {
        courseId: courseId,
        sessionTitle: sessionTitle,
        sessionType: sessionType,
        materials: materials
    };

    // Use the Fetch API to send the POST request to your Flask route
    fetch('/create_session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        if (data.success) {
            console.log('Success:', data.message);
            // You could redirect the user or show a success message in the UI
            alert(data.message); // Use a custom modal in production!
        } else {
            console.error('Error:', data.message);
            alert('Error creating session: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('Failed to connect to the server.');
    });
}

// Example HTML to trigger the function
// <form onsubmit="event.preventDefault(); submitSessionForm();">
//   <input type="text" id="course-id" value="1" hidden>
//   <input type="text" id="session-title" placeholder="Session Title">
//   <select id="session-type">
//     <option value="learning">Learning</option>
//     <option value="quiz">Quiz</option>
//   </select>
//   <button type="submit">Create Session</button>
// </form>
