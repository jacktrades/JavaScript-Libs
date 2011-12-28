//___________________________________________________________________________//
// srfi13
//
// srfi13 is a 'just for fun' implementation of Scheme's SRFI-13 library
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

// Putting the "use strict" statement here will affect all other files that
// are concatenated with this code.  If this file is concatenated with other
// files and they suddenly start breaking, comment this out.  For me this is
// preferable to adding "use strict" to every function definition in this file.
"use strict";


var srfi13 = (function () {
  
  var s = {};

  function char_set_or_function(criteria) {
    var fn;
    if (srfi13.is_string(criteria) && criteria.length === 1) {
      fn = function (a) { return a === criteria; };
    }
    else if (srfi13.is_string(criteria) && criteria.length > 1) {
      fn = function (a) { return criteria.indexOf(a) >= 0; };
    }
    else if (criteria instanceof Function) {
      fn = criteria;
    }
    return fn;
  }
  
  
  //________________________________________________________________________//
  // Predicates
  //________________________________________________________________________//

  s.is_string = function (obj) {
    // Return true if obj is a string, false if not
    
    // "hello" instanceof String returns false and
    // typeof new String("hello") returns Object
    // both tests are needed to correctly return true for any string instance
    if (obj instanceof String || typeof obj === 'string') { return true; }
    else { return false; }
  };

  s.is_string_null = function (obj) {
    return (s.is_string(obj) && obj.length === 0);
  };

  s.every = function (criteria, str, start, end) {
    // Checks to see if the given criteria is true of every character in s
    var fn = char_set_or_function(criteria);
    start = start || 0;
    end = end || str.length;
    if (start < 0) { start = str.length + start; }
    if (end < 0) { end = str.length + end; }
    for (start; start < end; start++) {
      if (!fn(str[start])) {
        return false;
      }
    }
    return true;
  };
  
  s.any = function (criteria, str, start, end) {
    // Checks to see if the given criteria is true of any character in s
    var fn = char_set_or_function(criteria);
    start = start || 0;
    end = end || str.length;
    if (start < 0) { start = str.length + start; }
    if (end < 0) { end = str.length + end; }
    for (start; start < end; start++) {
      if (fn(str[start])) {
        return true;
      }
    }
    return false;
  };
  
  
  //________________________________________________________________________//
  // Constructors
  //________________________________________________________________________//
  
  s.make_string = function (len, char_or_fn) {
    var str = "",
        i;
    if (s.is_string(char_or_fn) && char_or_fn.length === 1) {
      return new Array(len+1).join(char_or_fn);
    }
    else {
      for (i=0; i < len; i++) {
        str += char_or_fn(i);
      }
      return str;
    }
  };
  
  s.tabulate = s.make_string;
  
  
  //________________________________________________________________________//
  // Array & string conversion
  //________________________________________________________________________//
  
  s.array_to_string = function (array) {
    return array.join('');
  };
  
  s.string_to_array = function (str) {
    return str.split('');
  };
  
  s.reverse_array_to_string = function (array) {
    return array.reverse().join('');
  };
  
  s.join = function (array, delimiter, grammar) {
    var str = array.join(delimiter);
    if (grammar === 'prefix' && array.length !== 0) {
      return delimiter + str;
    }
    else if (grammar === 'suffix' && array.length !== 0) {
      return str + delimiter;
    }
    return str;
  };
  
  
  //________________________________________________________________________//
  // Selection
  //________________________________________________________________________//
  
  s.length = function (str) {
    return str.length;
  };
  
  s.ref = function (str, idx) {
    if (idx < 0) {
      idx = str.length + idx;
    }
    return str[idx];
  };
  
  s.substring = function (str, start, end) {
    end = end || str.length;
    if (start < 0) {
      start = str.length + start;
    }
    if (end < 0) {
      end = str.length + end;
    }
    return str.substring(start, end);
  };
  
  s.take = function (str, num_chars) {
    return s.substring(str, 0, num_chars);
  };
  
  s.drop = function (str, num_chars) {
    return s.substring(str, -num_chars + 1);
  };
  
  s.take_right = function (str, num_chars) {
    return s.substring(str, -num_chars);
  };
  
  s.drop_right = function (str, num_chars) {
    return s.substring(str, 0, num_chars - 1);
  };
  
  s.pad = function (str, len, char, start, end) {
    var p;
    char = char || " ";
    str = s.substring(str, start, end);
    if (len < str.length) {
      str = s.substring(str, -len);
    }
    else if (len > str.length) {
      p = new Array((len - str.length) + 1).join(char);
      return p + str;
    }
    return str;
  };
  
  s.trim_left = function (str, criteria, start, end) {
    var idx = 0,
        fn;
    if (typeof start !== 'undefined') {
      str = s.substring(str, start, end);
    }
    criteria = criteria || " \n\r";
    fn = char_set_or_function(criteria);
    while (idx < str.length && fn(str[idx])) {
      idx += 1;
    }
    return str.substring(idx, str.length);
  };
  
  s.trim_right = function (str, criteria, start, end) {
    var fn, idx;
    if (typeof start !== 'undefined') {
      str = s.substring(str, start, end);
    }
    criteria = criteria || " \n\r";
    fn = char_set_or_function(criteria);
    idx = str.length - 1;
    while (idx >= 0 && fn(str[idx])) {
      idx -= 1;
    }
    return str.substring(0, idx+1);
  };
  
  s.trim = function (str, criteria, start, end) {
    if (typeof start !== 'undefined') {
      str = s.substring(str, start, end);
    }
    str = s.trim_left(str, criteria);
    str = s.trim_right(str, criteria);
    return str;
  };
  
  
  //________________________________________________________________________//
  // Comparison
  // 
  // There is a lot of code duplication in these comparison functions.  This
  // is by design.  Abstracting these to use a comparison function instead of
  // primitive operators (< > = etc) results in a 15-40% decrease in
  // performance in Firefox 8 and Chrome 15.
  //________________________________________________________________________//
  
  s.compare = function (s1, s2, lt, eq, gt, s1start, s1end, s2start, s2end) {
    var i, j;
    if (typeof s1start !== 'undefined') {
      s1 = s.substring(s1, s1start, s1end);
    }
    if (typeof s2start !== 'undefined') {
      s2 = s.substring(s2, s2start, s2end);
    }
    s1start = s1start || 0;
    for (i=0, j=Math.min(s1.length, s2.length); i < j; i++) {
      if (s1[i] < s2[i]) {
        return lt(i + s1start);
      }
      else if (s1[i] > s2[i]) {
        return gt(i + s1start);
      }
    }
    if (s1.length < s2.length) {
      return lt(i + s1start);
    }
    else if (s1.length > s2.length) {
      return gt(i + s1start);
    }
    else {
      return eq(i + s1start);
    }
  };
  
  s.compare_ci = function (s1, s2, lt, eq, gt, s1start, s1end, s2start, s2end) {
    return s.compare(s1.toLowerCase(), s2.toLowerCase(), lt, eq, gt, s1start, s1end, s2start, s2end);
  };
  
  s.eq = function (s1, s2, s1start, s1end, s2start, s2end) {
    if (typeof s1start !== 'undefined') {
      s1 = s.substring(s1, s1start, s1end);
    }
    if (typeof s2start !== 'undefined') {
      s2 = s.substring(s2, s2start, s2end);
    }
    if (s1 === s2) {
      return s1.length;
    }
    else {
      return false;
    }
  };
  
  s.ltgt = function (s1, s2, s1start, s1end, s2start, s2end) {
    var i, j;
    if (typeof s1start !== 'undefined') {
      s1 = s.substring(s1, s1start, s1end);
    }
    if (typeof s2start !== 'undefined') {
      s2 = s.substring(s2, s2start, s2end);
    }
    s1start = s1start || 0;
    for (i=0,j=Math.min(s1.length, s2.length); i < j; i++) {
      if (s1[i] < s2[i] || s1[i] > s2[i]) {
        return i + s1start;
      }
    }
    if (s1.length !== s2.length) {
      return true;
    }
    else {
      return false;
    }
  };

  s.lt = function (s1, s2, s1start, s1end, s2start, s2end) {
    var i, j;
    if (typeof s1start !== 'undefined') {
      s1 = s.substring(s1, s1start, s1end);
    }
    if (typeof s2start !== 'undefined') {
      s2 = s.substring(s2, s2start, s2end);
    }
    s1start = s1start || 0;
    for (i=0,j=Math.min(s1.length, s2.length); i < j; i++) {
      if (s1[i] < s2[i]) {
        return i + s1start;
      }
      else if (s1[i] > s2[i]) {
        return false;
      }
    }
    if (s1.length < s2.length) {
      return s1.length;
    }
    else {
      return false;
    }
  };

  s.gt = function (s1, s2, s1start, s1end, s2start, s2end) {
    var i, j;
    if (typeof s1start !== 'undefined') {
      s1 = s.substring(s1, s1start, s1end);
    }
    if (typeof s2start !== 'undefined') {
      s2 = s.substring(s2, s2start, s2end);
    }
    s1start = s1start || 0;
    for (i=0,j=Math.min(s1.length, s2.length); i < j; i++) {
      if (s1[i] > s2[i]) {
        return i + s1start;
      }
      else if (s1[i] < s2[i]) {
        return false;
      }
    }
    if (s1.length > s2.length) {
      return s2.length;
    }
    else {
      return false;
    }
  };

  s.lteq = function (s1, s2, s1start, s1end, s2start, s2end) {
    var i, j;
    if (typeof s1start !== 'undefined') {
      s1 = s.substring(s1, s1start, s1end);
    }
    if (typeof s2start !== 'undefined') {
      s2 = s.substring(s2, s2start, s2end);
    }
    s1start = s1start || 0;
    for (i=0,j=Math.min(s1.length, s2.length); i < j; i++) {
      if (s1[i] < s2[i]) {
        return i + s1start;
      }
      else if (s1[i] > s2[i]) {
        return false;
      }
    }
    if (s1.length <= s2.length) {
      return s1.length;
    }
    else {
      return false;
    }
  };

  s.gteq = function (s1, s2, s1start, s1end, s2start, s2end) {
    var i, j;
    if (typeof s1start !== 'undefined') {
      s1 = s.substring(s1, s1start, s1end);
    }
    if (typeof s2start !== 'undefined') {
      s2 = s.substring(s2, s2start, s2end);
    }
    s1start = s1start || 0;
    for (i=0,j=Math.min(s1.length, s2.length); i < j; i++) {
      if (s1[i] > s2[i]) {
        return i + s1start;
      }
      else if (s1[i] < s2[i]) {
        return false;
      }
    }
    if (s1.length >= s2.length) {
      return s2.length;
    }
    else {
      return false;
    }
  };
  
  s.ci_eq = function (s1, s2, s1start, s1end, s2start, s2end) {
    return s.eq(s1.toLowerCase(), s2.toLowerCase(), s1start, s1end, s2start, s2end);
  };
  
  s.ci_ltgt = function (s1, s2, s1start, s1end, s2start, s2end) {
    return s.ltgt(s1.toLowerCase(), s2.toLowerCase(), s1start, s1end, s2start, s2end);
  };
  
  s.ci_lt = function (s1, s2, s1start, s1end, s2start, s2end) {
    return s.lt(s1.toLowerCase(), s2.toLowerCase(), s1start, s1end, s2start, s2end);
  };
  
  s.ci_gt = function (s1, s2, s1start, s1end, s2start, s2end) {
    return s.gt(s1.toLowerCase(), s2.toLowerCase(), s1start, s1end, s2start, s2end);
  };
  
  s.ci_lteq = function (s1, s2, s1start, s1end, s2start, s2end) {
    return s.lteq(s1.toLowerCase(), s2.toLowerCase(), s1start, s1end, s2start, s2end);
  };
  
  s.ci_gteq = function (s1, s2, s1start, s1end, s2start, s2end) {
    return s.gteq(s1.toLowerCase(), s2.toLowerCase(), s1start, s1end, s2start, s2end);
  };
  
  
  //________________________________________________________________________//
  // Prefixes & suffixes
  //________________________________________________________________________//
  
  s.prefix_length = function (s1, s2, s1start, s1end, s2start, s2end) {
    var i, j;
    if (typeof s1start !== 'undefined') {
      s1 = s.substring(s1, s1start, s1end);
    }
    if (typeof s2start !== 'undefined') {
      s2 = s.substring(s2, s2start, s2end);
    }
    for (i=0, j=Math.min(s1.length, s2.length); i < j; i++) {
      if (s1[i] !== s2[i]) {
        return i;
      }
    }
    return i;
  };
  
  s.suffix_length = function (s1, s2, s1start, s1end, s2start, s2end) {
    var i, j, count;
    if (typeof s1start !== 'undefined') {
      s1 = s.substring(s1, s1start, s1end);
    }
    if (typeof s2start !== 'undefined') {
      s2 = s.substring(s2, s2start, s2end);
    }
    for (i=s1.length-1, j=s2.length-1, count=0; i >= 0; i--, j--, count++) {
      if (s1[i] !== s2[j]) {
        return count;
      }
    }
    return count;
  };

  s.prefix_length_ci = function (s1, s2, s1start, s1end, s2start, s2end) {
    return s.prefix_length(s1.toLowerCase(), s2.toLowerCase(), s1start, s1end, s2start, s2end);
  };
  
  s.suffix_length_ci = function (s1, s2, s1start, s1end, s2start, s2end) {
    return s.suffix_length(s1.toLowerCase(), s2.toLowerCase(), s1start, s1end, s2start, s2end);
  };
  
  s.is_prefix = function (s1, s2, s1start, s1end, s2start, s2end) {
    // is s1 a prefix of s2?
    if (typeof s1start !== 'undefined') {
      s1 = s.substring(s1, s1start, s1end);
    }
    if (typeof s2start !== 'undefined') {
      s2 = s.substring(s2, s2start, s2end);
    }
    return s2.substring(0, s1.length) === s1;
  };
  
  s.is_suffix = function (s1, s2, s1start, s1end, s2start, s2end) {
    // is s1 a suffix of s2?
    if (typeof s1start !== 'undefined') {
      s1 = s.substring(s1, s1start, s1end);
    }
    if (typeof s2start !== 'undefined') {
      s2 = s.substring(s2, s2start, s2end);
    }
    return s2.substring(s2.length - s1.length, s2.length) === s1;
  };
  
  s.is_prefix_ci = function (s1, s2, s1start, s1end, s2start, s2end) {
    return s.is_prefix(s1.toLowerCase(), s2.toLowerCase(), s1start, s1end, s2start, s2end);
  };
  
  s.is_suffix_ci = function (s1, s2, s1start, s1end, s2start, s2end) {
    return s.is_suffix(s1.toLowerCase(), s2.toLowerCase(), s1start, s1end, s2start, s2end);
  };
  
  s.starts_with = function (str, prefix, start, end) {
    // prefix may be either a string or an array of strings
    if (typeof start !== 'undefined') {
      str = s.substring(str, start, end);
    }
    if (s.is_string(prefix)) {
      return str.substring(0, prefix.length) === prefix;
    }
    else {
      for (var i=0, j=prefix.length; i < j; i++) {
        if (s.starts_with(str, prefix[i])) {
          return true;
        }
      }
      return false;
    }
  };
  
  s.ends_with = function (str, suffix, start, end) {
    // prefix may be either a string or an array of strings
    if (typeof start !== 'undefined') {
      str = s.substring(str, start, end);
    }
    if (s.is_string(suffix)) {
      return str.substring(str.length-suffix.length, str.length) === suffix;
    }
    else {
      for (var i=0, j=suffix.length; i < j; i++) {
        if (s.ends_with(str, suffix[i])) {
          return true;
        }
      }
      return false;
    }
  };
  
  
  //________________________________________________________________________//
  // Searching
  //________________________________________________________________________//
  
  s.index = function (str, criteria, start, end) {
    start = start || 0;
    end = end || str.length;
    if (start < 0) { start = str.length + start; }
    if (end < 0) { end = str.length + end; }
    criteria = char_set_or_function(criteria);
    for (start; start < end; start++) {
      if (criteria(str[start])) {
        return start;
      }
    }
    return false;
  };
  
  s.index_right = function (str, criteria, start, end) {
    start = start || 0;
    end = end || str.length-1;
    if (start < 0) { start = str.length + start; }
    if (end < 0) { end = str.length + end; }
    criteria = char_set_or_function(criteria);
    for (end; end >= start; end--) {
      if (criteria(str[end])) {
        return end;
      }
    }
    return false;
  };
  
  s.skip = function (str, criteria, start, end) {
    start = start || 0;
    end = end || str.length;
    if (start < 0) { start = str.length + start; }
    if (end < 0) { end = str.length + end; }
    criteria = char_set_or_function(criteria);
    for (start; start < end; start++) {
      if (!criteria(str[start])) {
        return start;
      }
    }
    return false;
  };
  
  s.skip_right = function (str, criteria, start, end) {
    start = start || 0;
    end = end || str.length-1;
    if (start < 0) { start = str.length + start; }
    if (end < 0) { end = str.length + end; }
    criteria = char_set_or_function(criteria);
    for (end; end >= start; end--) {
      if (!criteria(str[end])) {
        return end;
      }
    }
    return false;
  };
  

  
  return s;
})();

