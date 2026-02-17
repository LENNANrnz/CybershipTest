# Shipping Service Project

## Design Decisions

This project is built using a layered architecture combined with the **Strategy and Facade patterns**. The main design principles include:

- **Layered structure**: The project separates concerns into Models, Services, and Handlers.
- **Strategy pattern**: Each carrier (UPS, FedEx, etc.) is implemented as a separate strategy, allowing easy extension for new carriers in the future.
- **Facade/Handler approach**: Centralizes request handling, making the system easier to maintain and scalable.
- **Validation and mapping**: Each request is validated and mapped to the appropriate carrier payload.
- **Scalability and maintainability**: This architecture allows new carriers, features, and error handling logic to be integrated with minimal changes to existing code.

This pattern ensures that the system is modular, reusable, and easy to extend, which is critical when integrating multiple shipping carriers with different APIs.

## How to Run Locally

To run the project locally:

```bash
npm install
npm run dev

Upon running, the application will prompt for a JSON input. This JSON should describe the shipment request in a single line. Paste your JSON directly into the console when prompted.

Example placeholder for JSON input (single line):

{"carrier":"UPS","origin":{"name":"Acme Corp","street1":"1000 Main Street","city":"New York","state":"NY","postalCode":"10001","countryCode":"US"},"destination":{"name":"John Doe","street1":"200 Elm Street","city":"Los Angeles","state":"CA","postalCode":"90001","countryCode":"US"},"packages":[{"dimensions":{"length":12,"width":8,"height":6,"unit":"IN"},"weight":{"value":5.5,"unit":"LB"}}],"serviceLevel":"EXPRESS"}

Make sure your JSON includes all necessary fields like carrier, origin, destination, packages, and serviceLevel.

Future Improvements

If more time were available, the following enhancements would be implemented:

Generic error handling service: A centralized service for handling errors from any request, reusable across all controllers and services.

Generic response handling service: A reusable service to standardize data responses from different carriers.

Validation service: A generic validation class that can be inherited by all controllers or services to enforce consistent validation rules and messaging across the application.

Improved scalability for endpoints: With the generic services above, adding new endpoints or carriers would require minimal code duplication, increasing overall maintainability and reducing development time for future features.

This approach would make the system even more robust, maintainable, and ready for scaling to multiple carriers and endpoints.