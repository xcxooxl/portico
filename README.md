## Portico-Assignment
# Getting Started

To run this project, you'll need to have Docker and docker-compose installed on your machine. 

- Clone this repository to your local machine.
- Navigate to the project directory in your terminal.
- Run the following command to start the project: docker-compose up --build

- This will build the Docker containers and start the project. Once the containers are running, you can access the project by navigating to http://localhost:8000 in your web browser.

# Endpoints

- The following endpoints are available in the project:
- POST http://localhost:8000/properties - This is for creating properties.
- GET http://localhost:8000/properties/:id/records/ - This is for getting records for a property.
- POST http://localhost:8000/properties/:id/records/ - This is for creating records for a property.
- GET http://localhost:8000/properties/:id/balance - This is for getting the balance for a property.
- GET http://localhost:8000/properties/:id/month-report?year=2023&month=2 - This is for getting the month report for a property.

please note that the endpoint for searching records supports the following query params:
- type: 1/0 (Income/Expense)
- order: 1/0 (Ascending/Descending)
- limit: number of records to return (has a cap)
- lastRecordId: id of the last record returned in the previous request for pagination purposes.


please note that the month for this API is 0-indexed,
meaning that January is 0 and December is 11.
