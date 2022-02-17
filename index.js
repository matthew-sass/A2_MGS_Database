const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

express()
  .use(express.json())
  .use(express.urlencoded({extended:false}))
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/rectanglesmain', async (req, res) =>{
    try{
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM rectangles');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/rectanglesmain', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .get('/errorPage', (req, res)=>{
    res.render('pages/errorPage');
  })

  .get('/rectangle/:id', async (req, res)=>{
    try{
      var id = req.params.id;
      const rectanglesInfoClient = await pool.connect();
      const getRectanglesInfoQuery = await pool.query(`SELECT * FROM rectangles WHERE id=${id}`);
      const rectanglesInfo = {'rectanglesInfo': (getRectanglesInfoQuery) ? getRectanglesInfoQuery.rows : null};
      res.render('pages/rectanglesinfo', rectanglesInfo);
      rectanglesInfoClient.release();
    } catch (err){
      res.render('pages/errorPage');
    }
  })
  .get('/rectangle/edit/:id', async (req, res)=>{
    try{
      var id = req.params.id;
      const rectanglesEditInfoClient = await pool.connect();
      const getRectanglesEditInfoQuery = await pool.query(`SELECT * FROM rectangles WHERE id=${id}`);
      const rectanglesEditInfo = {'rectanglesInfo': (getRectanglesEditInfoQuery) ? getRectanglesEditInfoQuery.rows : null};
      res.render('pages/rectanglesedit', rectanglesEditInfo);
      rectanglesEditInfoClient.release();
    } catch (err){
      res.render('pages/errorPage');
    }
  })
  .get('/newrectangle', (req, res)=>{
    console.log("Create New Rectangle")
    res.render('pages/newrectangle');
  })

  

  .post('/addrectangle', async (req, res)=>{
    try{
      const rectanglesAddRectangleClient = await pool.connect();
      var id = req.body.id;
      var name = req.body.name;
      var width = req.body.width;
      var height = req.body.height;
      var color = req.body.color;
      const rectanglesAddRectangleQuery = await rectanglesAddRectangleClient.query(`INSERT INTO rectangles values(${id}, '${name}', '${width}', '${height}', '${color}');`)
      const addRectangle = {'addRectangle': (rectanglesAddRectangleQuery) ? rectanglesAddRectangleQuery.rows : null};
      const rectanglesAddRectangleUpdatedQuery = await rectanglesAddRectangleClient.query(`SELECT * FROM rectangles`);
      const results = { 'results': (rectanglesAddRectangleUpdatedQuery) ? rectanglesAddRectangleUpdatedQuery.rows : null};
      res.render('pages/newrectangle', results);
      rectanglesAddRectangleClient.release();
    } catch (err){
      res.render('pages/errorPage');
    }
  })

  .post('/deleterectangle', async (req, res)=>{
    try{
      const rectanglesDeleteRectangleClient = await pool.connect();
      var did = req.body.deleteid;
      const rectanglesDeleteRectangleQuery = await rectanglesDeleteRectangleClient.query(`DELETE FROM rectangles WHERE id=${did}`);
      const deleteRectangle = {'deleteRectangle': (rectanglesDeleteRectangleQuery) ? rectanglesDeleteRectangleQuery.rows : null};
      const rectanglesDeleteRectangleUpdatedQuery = await rectanglesDeleteRectangleClient.query(`SELECT * FROM rectangles`);
      const results = { 'results': (rectanglesDeleteRectangleUpdatedQuery) ? rectanglesDeleteRectangleUpdatedQuery.rows : null};
      res.render('pages/rectanglesmain', results);
      rectanglesDeleteRectangleClient.release();
    } catch (err){
      res.render('pages/errorPage');
    }
  })

  .post('/submitEdit', async (req, res)=>{
    try{
      const submitEditClient = await pool.connect();
      var id = req.body.id;
      var name = req.body.name;
      var width = req.body.width;
      var height = req.body.height;
      var color = req.body.color;
      const updateTable = submitEditClient.query(`UPDATE rectangles SET  name='${name}', width=${width}, height=${height}, color='${color}' WHERE id=${id};`);
      const updateTableResults = {'updateTableResults': (updateTable) ? updateTable.rows: null};
      const edittedQuery = await submitEditClient.query(`SELECT * FROM rectangles where id=${id};`);
      const submitEditResults = { 'rectanglesInfo': (edittedQuery) ? edittedQuery.rows : null};
      res.render('pages/rectanglesedit', submitEditResults);
      submitEditClient.release();
    } catch (err){
      res.render('pages/errorPage');
    }
  })
  
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
 