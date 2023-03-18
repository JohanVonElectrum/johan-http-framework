# johan-http-framework
An HTTP framework inspired by Nuxt but more lightweight.

History and Architecture:
1. I was inspired by Nuxt to base this framework on **decorators**.
2. The internal HTTP listener works with **express**, but the whole app is wrapped by the framework.
3. The application is created with a given set of **controllers** that defines all HTTP endpoints and their functionality.
