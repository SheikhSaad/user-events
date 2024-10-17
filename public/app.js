document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('userId').value;
    const eventType = document.getElementById('eventType').value;
    const properties = document.getElementById('properties').value;

    try {
        const response = await fetch('/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                eventType,
                properties: properties ? JSON.parse(properties) : {}
            }),
        });

        if (response.ok) {
            alert('Event tracked successfully');
            fetchAggregation();
            fetchRecentEvents();
        } else {
            const errorData = await response.json();
            alert(`Failed to track event: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while tracking the event');
    }
});

async function fetchAggregation() {
    try {
        const response = await fetch('/api/aggregate');
        if (!response.ok) {
            throw new Error('Failed to fetch aggregation data');
        }
        const data = await response.json();
        const aggregationDiv = document.getElementById('aggregationData');
        aggregationDiv.innerHTML = '<h3>Event Type Counts:</h3>';
        if (data.length === 0) {
            aggregationDiv.innerHTML += '<p>No events tracked yet.</p>';
        } else {
            data.forEach(item => {
                aggregationDiv.innerHTML += `<p>${item._id}: ${item.count}</p>`;
            });
        }
    } catch (error) {
        console.error('Error fetching aggregation:', error);
        document.getElementById('aggregationData').innerHTML = '<p>Error fetching aggregation data. Please try again later.</p>';
    }
}

async function fetchRecentEvents() {
    try {
        const response = await fetch('/api/events');
        if (!response.ok) {
            throw new Error('Failed to fetch recent events');
        }
        const events = await response.json();
        const eventsDiv = document.getElementById('recentEvents');
        eventsDiv.innerHTML = '<h3>Recent Events:</h3>';
        if (events.length === 0) {
            eventsDiv.innerHTML += '<p>No events tracked yet.</p>';
        } else {
            events.forEach(event => {
                eventsDiv.innerHTML += `
                    <p>
                        User: ${event.userId}<br>
                        Event: ${event.eventType}<br>
                        Time: ${new Date(event.timestamp).toLocaleString()}<br>
                        Properties: ${JSON.stringify(event.properties)}
                    </p>
                    <hr>
                `;
            });
        }
    } catch (error) {
        console.error('Error fetching recent events:', error);
        document.getElementById('recentEvents').innerHTML = '<p>Error fetching recent events. Please try again later.</p>';
    }
}

fetchAggregation();
fetchRecentEvents();