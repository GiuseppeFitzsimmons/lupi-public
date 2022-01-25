# LuPi

LuPi is an upcoming ERP tool built for the fashion industry. Its client application is written in React and makes use of Redux; its back-end is a REST API architecture written in NodeJS and deployed on AWS using serverless methodology.

## Topology

### Back-end

The back-end is a serverless topology presenting a RESTful API layer. The client accesses a static React application residing in an S3 bucket and served by CloudFront. Further requests are to go through a custom authenticator, which is currently implemented at the Lambda-level. Following this, requests are fed to an API Gateway, which points towards the relevant Lambda, which then operates on the relevant DynamoDB table via a custom DAL.

### Front-end

The front-end is a classic React/Redux webapp. It previously made use of Redux-slices, but following an architectural review I have begun migrating it towards a more traditional Redux setup.

### Unit tests

Unit tests are based on Jest, complete with their own mock data suite which tears itself down cleanly, leaving no orphaned relics in the database. Every Lambda has its own battery of unit tests. To run a test, execute the following command at the root of the project:
```
npx jest back/{$nameOfLambda}
```

### How to build and deploy

The client can be run using the following command, launched from the /front folder:
```
npm run start
```
The backend can be launched locally using the same command, launched from the /back folder. Deploying to a non-local environment is done with AWS CodePipeline - either manually via the console, or automatically via a subscription to the Github repository which launches a deployment when a new commit arrives. When deploying via CodePipeline, a manual approval step has been added.

### Todo

* Unit Tests</br>
Currently, unit tests only deal with happy path. Additionally, not every test contains assertions.
* Custom Authenticator</br>
As said previously, authentication is currently handled at the Lambda level, bypassing some advantages of a Custom Authenticator such as caching. While the current solution does include scope management, the objective is to generalize this logic in an actual Custom Authenticator.
* Redux</br>
The previous architecture based on Redux Slices began showing cracks related to synchronicity, and I am in the process of moving to a traditional Redux architecture.
* UI</br>
The UI is currently in very early stages, particularly given I'm in the process of migrating the Redux architecture.