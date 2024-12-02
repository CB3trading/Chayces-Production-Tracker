// Sample data for testing the Production Tracker
const sampleData = {
    // Example week 1
    "2024-W10": [
        {
            date: "2024-03-04",
            unitType: "HAFO (48)",
            units: 3,
            rate: 50,
            earnings: 150,
            notes: "Morning shift"
        },
        {
            date: "2024-03-05",
            unitType: "HBFO (96)",
            units: 2,
            rate: 50,
            earnings: 100,
            notes: "Afternoon work"
        }
    ],
    
    // Example week 2
    "2024-W11": [
        {
            date: "2024-03-11",
            unitType: "HAFO (144)",
            units: 1,
            rate: 70,
            earnings: 70,
            notes: ""
        },
        {
            date: "2024-03-12",
            unitType: "PMSR",
            units: 4,
            rate: 25,
            earnings: 100,
            notes: "Rush order"
        },
        {
            date: "2024-03-13",
            unitType: "Light Level Readings",
            units: 5,
            rate: 10,
            earnings: 50,
            notes: "Building A"
        }
    ]
};

// Load sample data if no saved data exists
if (!localStorage.getItem('savedWeeks')) {
    localStorage.setItem('savedWeeks', JSON.stringify(sampleData));
}
