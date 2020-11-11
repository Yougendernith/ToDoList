//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// connecting the mongodb server and creating the database
mongoose.connect("mongodb+srv://admin-yougendar:yougender456@cluster0.ubpwj.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.set("useFindAndModify",false);


// creating a schema for our documents or data
const itemSchema =new mongoose.Schema({
  name: String
})


// creating the collection('item') in our database
const Item=mongoose.model("Item",itemSchema)


// creating our first document or data
const item1=new Item({
  name:"Hi, welcome to your todolist"
});

// creating our second document or data
const item2=new Item({name:"Hit the + button to add a new item"});

// creating our third document or data
const item3=new Item({name:"<-- Hit this to delete an item"});


// storing the above created documents in an array called defaultItems
const defaultItems=[item1,item2,item3]


const listSchema={
  name:String,
  items:[itemSchema]
}

const List=mongoose.model("List",listSchema)



// creating a home route("/") and inside the home route we are rendering our data from our database to our webpage
app.get("/",function(req,res){

  // reading the data from our database
  Item.find({},function(err,foundItems){

    // checking whether items in our database is null or not, if yes, then inserting the defaultItems created above in our database
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){ //inserting the data in our database
        if (err){
            console.log(err);
        }
        else{
            console.log("successfully  added items to the database");
        }
      });

      //after inserting the data in our database we are being redirected to the home route
      res.redirect("/");
    }else{

    //after being redirected from the home route we are rendering the data("foundItems") from our database to our webpage
    res.render("list",{listTitle:"Today",newListItems:foundItems})
    }
  });
});


// creating a dynamic route using the  express route parameter
app.get("/:customListName",function(req,res){

// captitalizing the heading using lodash and storing it in variable
  const customListName=_.capitalize(req.params.customListName);


  //if we do not have the route then we are creating the route and adding the default items to the new list collection
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        })
        list.save();
        res.redirect("/" + customListName);
      }else{
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items}) // once we have created the route then we are rendering the page in out web page
      }
    }
  })
})


// adding a new item to our webpage and to our database
app.post("/", function(req, res){

// storing the input value in a variable called itemName
  const itemName = req.body.newItem;
  const listName=req.body.list;

// inserting the input value in our database
  const item=new Item(
    {name:itemName
    })

    if(listName==='Today'){
      // saving the item in the database
    item.save()
    res.redirect("/")
    }else{
      // reading the item and pushing it into items array and saving the item in the database and again redirecting to the custom route to render the item in our webpage
      List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }



  
});



app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.list_name; 


  // if our listname is the home then we delete and redirect to the home route
// if (listName==="Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err){
      console.log("successfully deleted the checked item");
      res.redirect("/");
    }
  });



// by using pull method we are going into an array and from that array we are deleting a particular item
// else{
// List.findOneAndUpdate({name : listName} , {$pull:{items : {_id : checkedItemId}}},
//   function(err,foundList){
//       if(!err){
//         res.redirect("/" + listName); // we are redirecting to the custom route
//       }
//     });
// }
 

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
