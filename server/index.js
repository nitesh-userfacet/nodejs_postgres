const express = require('express');
const app = express();
const port  = 3000;
const myParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const uploadImage = async(req,res,next)=>{
  console.log("base64 is called")
  
   try{
    
    const path = __dirname +'/images/'+ Date.now()+'.png';
    const image = req.body.base64String;
    // console.log(image);
    const base64Data = image.replace('data:', '')
    .replace(/^.+,/, '');
    console.log("after formatting ")
    
    fs.writeFile(path, base64Data, 'base64',(error)=>{
      console.log(error);
      
    });
    return res.send(path);
   }
   catch(error){
    // console.log(error);
     res.status(400).json({message:error});

   }
  
  
}
app.use(myParser.json({limit: '200mb'}));
app.use(myParser.urlencoded({limit: '200mb', extended: false}));
const storage = multer.diskStorage({   
  destination: function(req, file, cb) { 
     cb(null, './uploads');    
  }, 
  filename: function (req, file, cb) { 
     cb(null , file.originalname);   
  }
});
const upload = multer({
  dest:'uploads/',
  storage: storage,
  limits : {fileSize : 50000000}
}); //50MB

// postgres connection establishment 
const Pool = require('pg').Pool;
const pool = new Pool({
 user : 'nitesh',
 password:'Abcd@123',
 database:'api',
 host:'localhost',
 port:5432,
});


// app.use(bodyParser.json());// middle ware that only parses json  and all that request whose content type matches
// app.use(bodyParser.urlencoded({
//   extended:true,  // parses the data with querystring 
// }))

app.post('/upload',upload.array('myFile',5),(req,res)=>{
  try{
    res.send(req.files);

  }catch(error){
    console.log('error occured')
    console.log(error);
    res.send(400);
  }
})
app.post('/uploadBase64',uploadImage);
app.get('/getDetails',(req,res)=>{
  res.status(200);
  res.send({"message":"Hello there "});
})







app.get('/users',(req,res)=>{
  pool.query('Select *from users order by id ASC',(error,results)=>{
    if(error){
      res.status(400);
      res.send({"message":error});

    }
    res.status(200);
    res.json(results.rows);
    res.end();
  })
})

//get a user by single id
app.get('/users/:id',(req,res)=>{
  const id = req.params.id;
  pool.query('select *from users where id =$1',[id],(error,results)=>{
    if(error){
      res.status(400).send({"message":"error"});
    }
    res.status(200).json(results.rows);
  })
});

app.post('/users',(request,response)=>{
  console.log(request.body);
  const { name, email } = request.body

  pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`User added with ID: ${results.rows[0].id}`)
  })
})

app.put("/users/:id",(req,res)=>{
  const id = parseInt(req.params.id);
  const {name,email} = req.body;


  pool.query('Update users SET name = $1 , email = $2 where id = $3',[name, email,id],(error, results)=>{
    if(error){
      res.status(400).send({"message":error});
      
    }
    else
    res.status(200).send(`user modified with ID : ${id}`);
  })
})
app.put("/users/delete/:id",(req,res)=>{
  const id = parseInt(req.params.id);

  pool.query('Delete from users where id = $1',[id],(error, results)=>{
    if(error){
      res.status(400).send({"message":error});

    }
    else{
      res.status(201).send(`Deleted user with ID : ${id}`);

    }
  })
})

app.listen(port,()=>{
  console.log(`Server is up and running on port ${port}`);
})

