# Rescale

To run this project
```
# Clone the repository
git clone

# Navigate to the project directory
cd rescale

# Start stack with tests 
make test

```

Make test will start the backend and a test frontend service that executes the playwright tests.
After the tests are completed, frontend container will be spun up and you can access the application with the test data at [http://localhost:3000](http://localhost:3000).

## Performance Considerations
While writing this code, the primary focus on performance was surrounding the handling of large datasets in the frontend specifically.

### Frontend
The frontend was built using Next.js and React. The main performance considerations were around the rendering of large datasets. To handle this, I implemented virtualized scrolling and react-query/tan-query to optimize data fetching and caching. The virtualized scrolling allows us to only render the items that are currently visible in the viewport, which significantly reduces the number of DOM nodes and improves performance when dealing with large lists. Additionally, react-query/tan-query provides caching and background fetching with mutations support which allows us to optimisitically update the UI without having to refetch the entire dataset.

### Backend
The only real backend optimization was the use of was the connection pooling in the database settings. If I was focusing more on the backend, I would have dived deeper into the sql queries that the ORM generates and tried to optimize them further. Since djangorestframework offered cursor pagination, I opted to use that for the virtualized scrolling on the frontend with the sacrifice that we would not be able to do any filtering and sorting easily. If I had more time, I would have implemented a separate endpoint that provided optimized queries for filtering and sorting.

## AI Usage
For this project, I used OpenCode an opensource project similar to ClaudeCode with Claude Sonnet 4 but with LSP support.
I only used AI after familiarizing myself with django and setting up the dependencies that I wanted. Along the way, if there were small stylistic changes or errors I would fix them myself.

My approach to prompt engineering is to be consistent with managing the context window and to extensively use the planning mode to prevent edits that I would not approve. 
Here are the sessions for implementing the different parts of the project: 

(Implmenting cursor pagination using django-rest-framework)[https://opencode.ai/s/yQmaISIu]

(Implementing the frontend CRUD operation UIs for jobs)[https://opencode.ai/s/RUZXe8N5]

AI Got a ton of things right, especially surrounding the frontend implementation. 
Where it really struggled was with the playwright tests and getting them to work in docker. I had to fix a lot of the issues myself. Many of the issues were related to the different ways browser engines handle clicks through automation and network problems within docker that the AI could not figure out. 
