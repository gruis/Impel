/* 
  Copyright (c) 2009 Caleb Crane <license [at] simulacre.org>, Simulacre Publishing LLC

  Permission is hereby granted, free of charge, to any person
  obtaining a copy of this software and associated documentation
  files (the "Software"), to deal in the Software without
  restriction, including without limitation the rights to use,
  copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following
  conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.
  
  Except as contained in this notice, the name(s) of the above 
  copyright holders shall not be used in advertising or otherwise 
  to promote the sale, use or other dealings in this Software 
  without prior written authorization.
  
  The end-user documentation included with the redistribution, if 
  any, must include the following acknowledgment: "This product 
  includes software developed by Simulacre Publishing LLC 
  (http://www.simulacre.org/) and its contributors", in the same 
  place and form as other third-party acknowledgments. Alternately, 
  this acknowledgment may appear in the software itself, in the same
  form and location as other such third-party acknowledgments.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.
*/
if(!!Impel==false){var Impel=new Class({})}Impel.inTouch=new Class({Implements:[Options,Events],options:{name:"Impel_inTouch",displayName:"Impel inTouch",maxSize:4096,baseURL:null,versionsFile:"versions.json.php",tableFileSuffix:".json.php"},versions:$H({}),loaded:false,initialize:function(a,b){this.setOptions(a);this.addEvents(b);this.loadVersions(function(){this.loaded=true;this.ready()}.bind(this))},ready:function(){this.fireEvent("ready")},synced:function(){this.fireEvent("synced")},syncFailed:function(a){this.fireEvent("syncFailed",a)},syncing:function(){this.fireEvent("syncing")},updating:function(a){this.fireEvent("updating",a)},updated:function(c,a,b){this.fireEvent("updated",[c,a,b])},updateFailed:function(c,b,a){this.fireEvent("updateFailed",[c,b,a])},created:function(a){this.fireEvent("created",a)},createFailed:function(b,a){this.fireEvent("createFailed",[b,a])},loadVersions:function(d){try{if(!window.openDatabase){throw ("HTML 5 SQL database not supported")}else{this.db=openDatabase(this.options.name,"1.0",this.options.displayName,this.options.maxSize)}}catch(f){if(f==2){throw ("Encountered an error while opening the database: invalid database version")}else{throw ("Encountered an error while opening the database: unknown error "+f+".")}}var c,a,h,g,b;c=this;a=function(j,e){for(b=0;b<e.rows.length;b++){g=e.rows.item(b);c.versions.set(g.t,g.v)}d()};h=function(j,e){j.executeSql("SELECT * FROM table_versions;",[],a,function(k){throw ("Unable to retrieve list of current table versions: "+k.message)})};this.db.transaction(function(e){e.executeSql("CREATE TABLE IF NOT EXISTS table_versions('t' TEXT NOT NULL PRIMARY KEY, 'v' INT NOT NULL);",[],h,function(j,k){throw ("Unable to create table to cache version data: "+k.message)})}.bind(this),function(j,k){throw ("Unable to create table to cache version data: "+k.message)})},getVersion:function(a){return this.versions.get(a)},setVersion:function(b,a){this.versions.set(b,a);this.db.transaction(function(c){c.executeSql("INSERT INTO table_versions ('t', 'v') VALUES (?,?);",[b,a],null,function(e,d){e.executeSql("UPDATE table_versions SET v=? WHERE t=?",[a,b],null,function(f){throw ("Unable to save record: "+b+" = "+a+"\n"+f.message)})})})},checkForUpdates:function(a){if(this.options.baseURL==null){throw"baseURL attribute must be set when instantiating an Impel.inTouch object"}if(a==null){try{new JsonP(this.options.baseURL+this.options.versionsFile,{onComplete:function(e){this.checkForUpdates(e)}.bind(this)}).request()}catch(f){throw"Impel.inTouch requires the JsonP Class. Download it from: http://www.clientcide.com/docs/Request/JsonP"}}else{var g,d,c,b;g=null;d=[];c=null;a.each(function(e){if(e.table!=null){g=this.getVersion(e.table);if(e.version!=null){if(g==null||g<e.version){d.push(e.table)}}else{if(e.versions!=null){if(g==null||g<e.versions[e.versions.length-1]){c=[];for(b=e.versions.indexOf(g)+1;b<e.versions.length;b++){c.push(e.versions[b])}d.push({table:e.table,versions:c});c=null}}}g=null}}.bind(this));this.sync(d)}},sync:function(f){if(!this.loaded){throw"Implen.inTouch.sync() cannot be called before Impel.inTouch is finished initializing. Wait for the 'ready' event."}if(f==null){this.checkForUpdates()}else{if(f.length==0){this.synced();return}var g=f;var a=[];this.addEvent("updateFailed",function(h){g.erase(h);a.push(h);if(g.length==0){this.syncFailed(a)}});this.addEvent("updated",function(h){g.erase(h);if(g.length==0){if(a.length>0){this.syncFailed(a)}else{this.synced()}}d(h)});var c,e,d,b;e=this;c=[];this.addEvent("updating",function(h){b=h});d=function(h){if(h&&h!=b){return}var j=c.shift();if(!!j==false){return}e.updating(j.table);new JsonP(e.options.baseURL+j.table+"_"+j.version+e.options.tableFileSuffix,{onComplete:function(k){e.importData(k,d)}}).request()};f.each(function(h){if(typeof h=="string"){this.updating(h);new JsonP(this.options.baseURL+h+this.options.tableFileSuffix,{onComplete:function(j){this.importData(j)}.bind(this)}).request()}else{if(typeof h=="object"&&$type(h.versions)=="array"){for(i=0;i<h.versions.length;i++){c.push({table:h.table,version:h.versions[i]})}d()}}}.bind(this))}},importData:function(c){if(c.table==null||c.version==null){return}var d=this.getVersion(c.table);d=d||0;if(d!=null&&d>=c.version){this.updated(c.table,d,c.version);return}var a=function(f){return"SQL Error: "+f.message+"("+f.code+")"};var b="";if(c.create!=null||c.data!=null){this.db.transaction(function(f){if(c["pre-create"]!=null&&c["pre-create"].$family.name=="array"){c["pre-create"].each(function(g){f.executeSql(g,[],function(){},function(h,j){throw ("Statement failed: "+g+"\n"+a(j));return true})})}if(c.create!=null){f.executeSql(c.create,[],function(){this.created(c.table)}.bind(this),function(g,h){this.createFailed(c.table,a(h));throw ("Statement failed: "+c.create+"\n"+a(h));return true}.bind(this))}if(c.extra!=null&&c.extra.$family.name=="array"){c.extra.each(function(g){f.executeSql(g,[],null,function(h,j){throw ("Statement failed: "+g+"\n"+a(j));return true})})}if(c.data!=null&&c.data.$family.name=="array"){for(var e=0;e<c.data.length;e++){b=c.data[e];if(typeof(b)=="string"){f.executeSql(b,[],null,function(g,h){throw ("Failed to load data: "+b+"\n"+a(h));return true})}}}}.bind(this),function(){this.updateFailed(c.table,d,c.version)}.bind(this),function(){this.setVersion(c.table,c.version);this.updated(c.table,d,c.version)}.bind(this))}}});
