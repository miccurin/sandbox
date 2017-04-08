// check if an element exists in array using a comparer function
// comparer : function(currentElement)
Array.prototype.inArray = function(item) {
  for(var i=0; i < this.length; i++) {
    if(item === this[i]) return true;
  }
  return false;
};

// adds an element to the array if it does not already exist using a comparer
// function
Array.prototype.pushIfNotExist = function(item) {
  if (!this.inArray(item)) {
    this.push(item);
  }
};

// check if an element exists in array and delete it
Array.prototype.delete = function(item) {
  var index = -1;
  for (var i = 0; i < this.length; i++) {
    if (item === this[i]) {
      index = i;
      break;
    }
  }
  if (index != -1) {
    this.splice(index, 1);
  }
};

Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
  var dd  = this.getDate().toString();
  return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]); // padding
};
