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

    // Create default admin if not exists
    const adminExists = await usersCollection.findOne({
      email: "admin@fabrio.com",
    });

    if (!adminExists) {
      await usersCollection.insertOne({
        email: "admin@fabrio.com",

        role: "admin",
        status: "active",
        createdAt: new Date(),
      });
      console.log("Default admin created");
    }
    // Manager user
    const managerExists = await usersCollection.findOne({
      email: "manager@fabrio.com",
    });

    if (!managerExists) {
      await usersCollection.insertOne({
        email: "manager@fabrio.com",

        role: "manager",
        status: "active",
        createdAt: new Date(),
      });
      console.log("Default manager created");
    }

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
      const { email, role } = req.body;

      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        return res.send({ message: "User already exists" });
      }

      const newUser = {
        email,
        role: role || "buyer",
        status: "pending",
        createdAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      res.send(newUser);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email });

      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      res.send(user);
    });

    //  get all user
    app.get("/users", async (req, res) => {
      try {
        const allUsers = await usersCollection.find({}).toArray();
        res.json(allUsers);
      } catch (err) {
        res
          .status(500)
          .json({ message: "Failed to fetch users", error: err.message });
      }
    });
    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const { role, status } = req.body;

      const updateData = {};
      if (role) updateData.role = role;
      if (status) updateData.status = status;

      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData },
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await usersCollection.findOne({
        _id: new ObjectId(id),
      });
      res.json(updatedUser);
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
