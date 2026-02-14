const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://fabrio-db:gRuWSrHdJFeRBQXG@cluster0.9aos02c.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("fabrio");
    const productCollection = db.collection("products");
    const usersCollection = db.collection("users");

    //  latest product
    app.get("/latestProduct", async (req, res) => {
      const latestProducts = await productCollection
        .find({})
        .limit(6)
        .toArray();
      res.json(latestProducts);
    });
    // all product
    app.get("/allProducts", async (req, res) => {
      const allProducts = await productCollection.find({}).toArray();

      res.json(allProducts);
    });
    // product details
    app.get("/productsDetails/:id", async (req, res) => {
      const details = await productCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.json(details);
    });

    // users
    app.post("/users", async (req, res) => {
      const user = req.body;

      const existingUser = await usersCollection.findOne({ email: user.email });

      if (existingUser) {
        return res.send({ message: "User already exists" });
      }

      const result = await usersCollection.insertOne(user);nodemon
      res.send(result);
    });

    //
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
