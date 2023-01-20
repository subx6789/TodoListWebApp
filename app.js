//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
let day = date.getDate();
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {
  useNewUrlParser: true,
});
const itemsSchema = {
  name: { type: String, required: true },
};
const Item = mongoose.model("Item", itemsSchema);
const listSchema = {
  name: { type: String, required: true },
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);
app.get("/", (req, res) => {
  Item.find({}, (err, foundItem) => {
    res.render("list", { listTitle: day, newListItems: foundItem });
  });
});
app.post("/", (req, res) => {
  let itemName = req.body.newItem;
  const listName = req.body.listbtn;
  if (itemName !== "") {
    let item = new Item({
      name: itemName,
    });
    if (listName === day) {
      item.save();
      res.redirect("/");
    } else {
      List.findOne({ name: listName }, (err, foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
  } else {
    if (listName === day) res.redirect("/");
    else res.redirect("/" + listName);
  }
});
app.post("/delete", (req, res) => {
  const checkeditem = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === day) {
    Item.findByIdAndRemove(checkeditem, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted Successfully");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkeditem } } },
      (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});
app.get("/about", (req, res) => {
  res.render("about");
});
app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: [],
        });
        list.save(() => {
          res.redirect("/" + customListName);
        });
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    } else {
      console.log(err);
    }
  });
});
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
