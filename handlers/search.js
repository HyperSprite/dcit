// serach comes from http://blog.physalix.com/jquery-autocomplete-search-with-node-js-and-mongoose/

User = mongoose.model('User'); // Declare a new mongoose User

app.get('/search_member', function(req, res) {
   var regex = new RegExp(req.query["term"], 'i');
   var query = User.find({fullname: regex}, { 'fullname': 1 }).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20);
        
      // Execute query in a callback and return users list
  query.exec(function(err, users) {
      if (!err) {
         // Method to construct the json result set
         var result = buildResultSet(users); 
         res.send(result, {
            'Content-Type': 'application/json'
         }, 200);
      } else {
         res.send(JSON.stringify(err), {
            'Content-Type': 'application/json'
         }, 404);
      }
   });
});