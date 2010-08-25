/**
 * The AsyncUnitTestChain contains a list of aysnchronous unit tests to run one after the other after each 
 *  one reports that it has finished.
 *
 * The only way - without locking up the browser - to know when an asynchronous function has completed
 * is for that function to tell you. When we call a unit test we, therefore, hand it a AsyncUnitTestChain 
 * object containing the remaining tests. Once the unit test completes it must call one of three 
 * methods on the AsyncUnitTestChain object: 
 *  method next()             - The current test has finished, just move on to the next one
 *  method failure(unitTest)  - The current test has failed, now move onto the next
 *                              @params string unitTest - The name of the test that failed
 *  method success(unitTest)  - The current test has succeeded, now move onto the next
 *                              @params string unitTest - The name of the test that succeeded
 *
 * The AsyncTestChain class provides a few more methods and events
 *  Event complete      - All tests have completed
 *  method showResults  - Show the results of testing in the console. This method can be called
 *                        at any time, but shouldn't be until the complete event has fired. 
 *                        The results summary includes a list of which tests failed and succeeded
 *                        as well as the number of tests that reported inconclusive results. 
 *                        Failed and Succeeded tests will also include their run-time in 
 *                        milliseconds.
 */

var AsyncUnitTestChain = new Class({
  Implements: [Chain,Events],
  length: 0,
  num_run: 0,
  total_time: 0,
  failures: [],
  successes: [],
  initialize: function(){
    this.length = arguments.length;
    this.chain(arguments);
  },
  startTimer: function(timer){
    timer = (timer == null) ? 'start_time' : timer;
    this[timer] = new Date().valueOf();
  },
  stopTimer: function(timer){
    timer = (timer == null) ? 'start_time' : timer;
    var now = new Date().valueOf();
    if(this[timer] == null || this[timer] == 0)
      throw("Timer "+timer+" not found")
    var elapsed = now - this[timer];
    this[timer] = now;
    return elapsed + "ms";
  },
  failure: function(name){
    name = ($type(name) != 'string') ? 'undefined' : name;
    name = name + " " + this.stopTimer();
    this.failures.push(name);
    this.next();
  },
  success: function(name){
    name = ($type(name) != 'string') ? 'undefined' : name;
    name = name + " " + this.stopTimer();
    this.successes.push(name);
    this.next();        
  },
  next: function(){
    if(this.num_run == 0){
      this.startTimer('total_time');
      this.startTimer();
    } 
    
    if(this.num_run >= this.length){
      this.total_time = this.stopTimer('total_time');
      this.fireEvent('complete');
    } else {
      this.num_run++;
    }
    try{
      this.callChain(this);
    } catch(e){
      console.log("unreported failure: " + e);
      this.next();
    } 
  },
  showResults: function(){
    try{
      console.group("Unit Test Results");
    } catch(e) {
      console.log("Unit Test Results");
    }
    console.log("Executed "+this.num_run+" unit tests in "+this.total_time);
    console.log("  Failed: "+this.failures.length);
      this.failures.each(function(test){ console.log("    "+test); });
    console.log("  Succeeded: "+this.successes.length);
      this.successes.each(function(test){ console.log("    "+test); });
      var noR = this.num_run - (this.successes.length + this.failures.length);
    console.log("  Unreported: "+ noR);
    try{
      console.groupEnd();
    } catch(e) {
      console.log("End of Unit Test Results");
    }
  }
});