const express = require("express");

const bodyParser = require("body-parser");

const ejs = require("ejs");

const mongoose = require("mongoose");

const _ = require("lodash");

require("dotenv").config({path : 'vars/.env'});

const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

const userName = process.env.MONGO_USER;

const password = process.env.MONGO_PASS;

const myDatabase = process.env.MONGO_DATABASE;

const url = `mongodb+srv://${userName}:${password}@cluster0.1lwat6t.mongodb.net/todolistDB?retryWrites=true&w=majority`

mongoose
  .connect(
    url,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('Connected to database !!'))
  .catch((err) => console.log('Connection failed !!' + err.message));

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const ListSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", ListSchema);

app.get("/", async (req, res) => {
  const day = date.getDate();
  let foundItems = await Item.find({});
  try {
    if (foundItems.length === 0) {
      foundItems = await Item.insertMany(defaultItems);
      console.log("Successfully saved default items to todolistDB.");
      res.redirect("/");
    } else {
      res.render("lists", { listTitle: day, newListItems: foundItems });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }).then((foundList) => {
    if (!foundList) {
      // Create a new List
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      // Show an existing List
      res.render("lists", {
        listTitle: foundList.name,
        newListItems: foundList.items,
      });
    }
  }).catch((err) => {
    console.log(err);
  });
});

app.post("/", (req, res) => {
  console.log(req.body);
  const itemName = req.body.newItem;

  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  //? Check if thr list from which the user tries to add the item into is from the default list or a custom list
  if (listName === date.getDate()) {
    //* If it is from the default list we just do a simple save item, redirect back to the root route
    item.save();

    res.redirect("/");
  } else {
    //! If theuser came from a custom list, we find the custom list and add the new item to the items in that list and finally redirect back to the custom page
    List.findOne({ name: listName }).then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }).catch((err) =>{
      console.log(err);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.radio;

  const listName = req.body.listName;

  //? Delete an item from the default list
  if (listName === date.getDate()) {
    Item.findByIdAndDelete(checkedItemId)
      .then(() => {
        console.log("Item deleted");
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    //? Delete an item from a custom list
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    ).then(() => {
      res.redirect("/" + listName);
    }).catch((err) => {
      console.log(err);
    });
  }
});

app.post("/work", (req, res) => {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about", (req, res) => {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("Server started on port 3000");
});