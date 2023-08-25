# loadshedding tracker

App to track loadshedding using a hardware to track load-shedding and a frontend to show the data

## backend

A physical device sends a POST request (with auth) in the database which tracks the power cut, and then several GET requests are done from the frontend to calculate and show the data from the same server.

- Deploy the backend with uvicorn. You can see the Swagger docs at /docs. (openapi.json available in [here](./backend/openapi.json))

```text
POST /loadshedding (Creates a power cut entry, used in physical hardware, authenticated with key)
GET /loadshedding (Get loadshedding data (default: 30 days))
GET /loadshedding/today (Get today's loadshedding data)
GET /health (Health api)
```

## frontend

displays the calculated loadshedding data, current loadshedding status etc. made using react. visit the frontend folder for more info.
Deploy locally with `npm run start` and deploy it on Vercel or the like using `npm run build`

---
> ``ℹ️``Note
>
> _Aug 26, 2023_: Since the python backend costs a bit, currently suspending the server. Reason of creating the app at that time was the ever so frequent power cut that was happening in our counrty at that time.[1] Since then, the situation has improved greatly and getting close to none daily power cut. Basically no reason for the app to exist right now. Lets hope i won't need fire it up again. If you are facing severe power cuts and would like to track it, feel free to fork and fire up your own server. In it's prime, the app used to looks like the image attached below.

<p align="center">
    <img src="https://github.com/i3p9/loadshedding/assets/8825262/c8bab88e-b492-4ea3-9ee6-6585d3e26bd1" width="641" alt="web screenshot of loadshedding data frontend, chrome">
</p>


[1] https://thefinancialexpress.com.bd/national/dhaka-alone-experiencing-over-600-mw-of-load-shedding-during-daytime
