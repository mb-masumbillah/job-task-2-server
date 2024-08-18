const express = require("express")
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors")
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.3187xgx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        const productCollection = client.db('Job_Task_2_DB').collection('allProduct')



        app.get("/allProduct", async (req, res) => {
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            const data = await productCollection.find().skip(page * size)
                .limit(size).toArray()
            res.send(data)
        })

        // search
        app.get('/allProduct/search', async (req, res) => {
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            const { name } = req.query
            const query = { name: { $regex: name, $options: 'i' } }
            const products = await productCollection.find(query).skip(page * size)
                .limit(size).toArray()
            res.send(products)
        })

        // filter
        app.get('/allProduct/filter', async (req, res) => {
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            const { brand, category, min, max } = req.query

            let filters = {};

            if (brand) {
                filters.brand = brand;
            }

            if (category) {
                filters.category = category;
            }

            if (min && max) {
                filters.price = { $gte: parseFloat(min), $lte: parseFloat(max) };
            }


            const products = await productCollection.find(filters).skip(page * size)
                .limit(size).toArray()
            res.send(products)


        })

        // sort
        app.get('/allProduct/sort', async (req, res) => {
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            const { sort } = req.query
            if (sort === "ass") {
                const products = await productCollection.find().sort({ price: 1 }).skip(page * size)
                    .limit(size).toArray()
                res.send(products)
            } else if (sort === "des") {
                const products = await productCollection.find().sort({ price: -1 }).skip(page * size)
                    .limit(size).toArray()
                res.send(products)
            } else if (sort === "date") {
                const products = await productCollection.find().sort({ createdAt: -1 }).skip(page * size)
                    .limit(size).toArray()
                res.send(products)
            }

        })

        app.get('/productsCount', async (req, res) => {
            const count = await productCollection.estimatedDocumentCount()
            res.send({ count })
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get("/", (req, res) => {
    res.send("job task server")
})

app.listen(port, () => {
    console.log(`job task server is running ${port}`)
})