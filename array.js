//___________________________________________________________________________//
// array.js
//
// array.js is a collection of array functions
//
// Copyright (c) 2011, Nick Zarczynski
// All rights reserved.
// License: BSD 3-Clause
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//  * Neither the name of Nick Zarczynski nor the names of its
//    contributors may be used to endorse or promote products derived from
//    this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
// IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
// TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
// PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//___________________________________________________________________________//



var array = (function () {
  "use strict";

  var a = {};
  
  
  //________________________________________________________________________//
  // Private Methods
  //________________________________________________________________________//
  
  function shortest_array(args) {
    var shortest = args[0].length,
        i, j;
    for (i=0, j=args.length; i < j; i++) {
      if (args[i].length < shortest) {
        shortest = args[i].length;
      }
    }
    return shortest;
  }
  
  
  //________________________________________________________________________//
  // Equality
  //________________________________________________________________________//
  
  a.is_equal = function (a, b, eq) {
    // General array equality, eq is an optional function that accepts 2
    // arguments and returns a boolean value (defaults to ===).
    eq = (typeof eq === 'undefined') ? function (x, y) { return x === y; } : eq;
    if (a instanceof Array && b instanceof Array) {
      if (a.length === b.length) {
        for (var i=0,j=a.length; i < j; i++) {
          if (!array.is_equal(a[i], b[i], eq)) {
            return false;
          }
        }
        return true;
      }
      return false;
    }
    else {
      return eq(a, b);
    }
  };
  
  a.is_array = function (obj) {
    return obj instanceof Array || Object.prototype.toString.call(obj) == '[object Array]';
  };
  
  
  //________________________________________________________________________//
  // Constructors
  //________________________________________________________________________//
  
  a.tabulate = function (n, proc) {
    var arr = new Array(n),
        i;
    for (i=0; i < n; i++) {
      arr[i] = proc(i);
    }
    return arr;
  };
  
  a.make_array = function (n, fill) {
    return a.tabulate(n, function (i) { return fill; });
  };
  
  a.iota = function (count, start, step) {
    // Returns an array containing count elements:
    // [start, start+step ... start+(count*step)]
    // The start and step parameters default to 0 and 1, respectively.
    var temp = [],
        i;
    step = step || 1;
    start = start || 0;
    
    while (count > 0) {
      temp.push(start);
      start += step;
      count -= 1;
    }
    return temp;
  };

  
  a.range = function (start, stop, step) {
    // Returns an array containing the elements:
    // [start start+step ... last<stop]
    // The start and step parameters default to 0 and 1, respectively.
    var temp = [],
        i;
    step = step || 1;
    if (typeof stop === 'undefined') {
      stop = start;
      start = 0;
    }
    
    for (i = start; i < stop; i += step) {
      temp.push(i);
    }
    return temp;
  };
  
  
  //________________________________________________________________________//
  // Selectors
  //________________________________________________________________________//
  
  a.take = function (arr, n) {
    return arr.slice(0, n);
  };
  
  a.drop = function (arr, n) {
    return arr.slice(n, arr.length);
  };
  
  a.split_at = function (arr, i) {
    return [arr.slice(0, i), arr.slice(i, arr.length)];
  };
  
  
  
  
  //________________________________________________________________________//
  // map, fold, reduce, etc
  //________________________________________________________________________//
  
  a.map = function (fn /* array_1 ... array_n */) {
    // Returns a new array that is the result of applying fn to each element of
    // array.  fn is a function taking as many arguments as there are array
    // arguments and returning a single value.
    var out = [],
        args = Array.prototype.slice.call(arguments, 1),
        num_args = args.length,
        length = shortest_array(args),
        values, i, j;
    for (i=0; i < length; i++) {
      values = [];
      for (j=0; j < num_args; j++) {
        values.push(args[j][i]);
      }
      out.push(fn.apply(fn, values));
    }
    return out;
  };
  
  a.map$ = function (fn /* array_1 ... array_n */) {
    // Returns a new array that is the result of applying fn to each element of
    // array.  fn is a function taking as many arguments as there are array
    // arguments and returning a single value.
    var args = Array.prototype.slice.call(arguments, 1),
        num_args = args.length,
        out = args[0],
        length = shortest_array(args),
        values, i, j;
    for (i=0; i < length; i++) {
      values = [];
      for (j=0; j < num_args; j++) {
        values.push(args[j][i]);
      }
      out[i] = fn.apply(fn, values);
    }
    return out;
  };
  
  
  //________________________________________________________________________//
  // filtering and partitioning
  //________________________________________________________________________//
  
  a.filter = function (pred, array) {
    // Return a new array consisting of all the elements for which
    // pred(element) returns true.
    var out = [];
    for (var i=0, j=array.length; i < j; i++) {
      if (pred(array[i])) {
        out.push(array[i]);
      }
    }
    return out;
  };
  
  a.filter$ = function (pred, array) {
    // Like filter, except filter$ is allowed, but not required, to
    // destructively update array.
    for (var i=array.length-1; i >= 0; i--) {
      if (!pred(array[i])) {
        array.splice(i, 1);
      }
    }
    return array;
  };
  
  a.remove = function (pred, array, count) {
    // Remove count elements for which pred(element) returns true and return
    // a newly allocated array.  If count is not provided all elements
    // for which pred(element) returns true will be removed.
    var temp = [],
        i, j;
    if (typeof count === 'undefined') {
      for (i=0, j=array.length; i < j; i++) {
        if (!pred(array[i])) {
          temp.push(array[i]);
        }
      }
    }
    else {
      for (i=0, j=array.length; i < j; i++) {
        if (count > 0) {
          if (!pred(array[i])) {
            temp.push(array[i]);
          }
          else {
            count -= 1;
          }
        }
        else {
          temp.push(array[i]);
        }
      }
    }
    return temp;
  };
  
  a.remove$ = function (pred, array, count) {
    // Like remove except remove$ is allowed, but not required, to
    // destructively update array.
    var indicies_to_remove = [],
        i, j;
    if (typeof count === 'undefined') {
      for (i=0, j=array.length; i < j; i++) {
        if (pred(array[i])) {
          array.splice(i, 1);
          j -= 1;
          i -= 1;
          count -= 1;
        }
      }
    }
    else {
      for (i=0, j=array.length; i < j; i++) {
        if (count > 0) {
          if (pred(array[i])) {
            array.splice(i, 1);
            j -= 1;
            i -= 1;
            count -= 1;
          }
        }
        else {
          return array;
        }
      }
    }
    return array;
  };
  
  a.partition = function (pred, array) {
    // Returns an array consisting of two arrays, one containing elements for
    // which pred(element) returns true (return[0]) and one with elements for
    // which pred(element) returns false (return[1]).
    var temp_in = [],
        temp_out = [],
        i, j;
    for (i=0, j=array.length; i < j; i++) {
      if (pred(array[i])) {
        temp_in.push(array[i]);
      }
      else {
        temp_out.push(array[i]);
      }
    }
    return [temp_in, temp_out];
  };
  
  a.partition$ = function (pred, array) {
    // Like partition except partition$ is allowed, but not required, to
    // destructively update array to produce a result.
    var temp_out = [],
        i, j;
    for (i=0, j=array.length; i < j; i++) {
      if (!pred(array[i])) {
        temp_out.push(array[i]);
        array.splice(i, 1);
        i -= 1;
        j -= 1;
      }
    }
    return [array, temp_out];
  };
  
  
  //________________________________________________________________________//
  // Searching
  //________________________________________________________________________//
  
  a.index = function (pred /* array_1 ... array_n */ ) {
    // Return the index of the left-most element for which
    // pred(array_0[i], ..., array[n][i]) returns true.
    var args = Array.prototype.slice.call(arguments, 1),
        num_args = args.length,
        length = shortest_array(args),
        count = 0,
        values, i, j;
    for (i=0; i < length; i++) {
      values = [];
      for (j=0; j < num_args; j++) {
        values.push(args[j][i]);
      }
      if (pred.apply(pred, values)) {
        return count;
      }
      count += 1;
    }
    return -1;
  };
  
  a.indexOf = function (element, array, start) {
    // Return the index of the left-most element in array that === element or
    // -1 if no index matches.  The optional start argument can be used to
    // exclude the first n indices of the array.
    var native_indexOf = Array.prototype.indexOf,
        i, j;
    if (native_indexOf && array.indexOf === native_indexOf) {
      return array.indexOf(element, (start || 0));
    }
    for (i=(start || 0), j=array.length; i < j; i++) {
      if (element === array[i]) {
        return i;
      }
    }
    return -1;
  };
  
  a.find = function (pred, array) {
    // Return the first element of array which satisifes pred, false if no
    // element does.
    var i, j;
    for (i=0,j=array.length; i < j; i++) {
      if (pred(array[i])) {
        return array[i];
      }
    }
    return false;
  };
  
  a.any = function (pred /* array, ..., array_n */) {
    // Return true if pred(element) returns true for any element of array
    var args = Array.prototype.slice.call(arguments, 1),
        num_args = args.length,
        length = shortest_array(args),
        values, i, j;
    for (i=0; i < length; i++) {
      values = [];
      for (j=0; j < num_args; j++) {
        values.push(args[j][i]);
      }
      if (pred.apply(pred, values)) {
        return true;
      }
    }
    return false;
  };
  
  a.every = function (pred /* array, ..., array_n */) {
    // Return true if pred(element) returns true for all elements of array
    var args = Array.prototype.slice.call(arguments, 1),
        num_args = args.length,
        length = shortest_array(args),
        values, i, j;
    for (i=0; i < length; i++) {
      values = [];
      for (j=0; j < num_args; j++) {
        values.push(args[j][i]);
      }
      if (!pred.apply(pred, values)) {
        return false;
      }
    }
    return true;
  };
  
  
  //________________________________________________________________________//
  // Misc
  //________________________________________________________________________//
  
  a.copy = function (array) {
    // Return a shallow copy of an array
    var newArray = [],
        i, j;
    for (i=0, j=array.length; i < j; i++) {
      newArray.push(array[i]);
    }
    return newArray;
  };
  
  a.swap$ = function (array, idx1, idx2) {
    // Swap two elements in array, modifying the original array
    var tmp = array[idx2];
    array[idx2] = array[idx1];
    array[idx1] = tmp;
    return array;
  };
  
  a.swap = function (array, idx1, idx2) {
    // Swap two elements in array, returning a new array
    var newArray = a.copy(array);
    return a.swap$(newArray, idx1, idx2);
  };
  
  a.insert$ = function (arr, i, obj) {
    arr.splice(i, 0, obj);
    return arr;
  };
  
  a.pop$ = function (arr, i) {
    i = i || arr.length - 1;
    var temp = arr[i];
    arr.splice(i, 1);
    return temp;
  };
  
  a.reverse = function (arr) {
    var temp = [],
        i;
    for (i=arr.length-1; i >= 0; i--) {
      temp.push(arr[i]);
    }
    return temp;
  };
  
  
  //________________________________________________________________________//
  // Return the array object
  //________________________________________________________________________//
  
  return a;
})();
