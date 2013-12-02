use t::TestJemplate tests => 3;

filters {
    'macro_definition' => 'compile_lite',
    'macro_call' => 'compile_lite',
    'macro_call_with_complex_arguments' => 'compile_lite',
};
run_is 'macro_definition' => 'js';
run_is 'macro_call' => 'js';
run_is 'macro_call_with_complex_arguments' => 'js';

__END__

===
--- macro_definition
[% MACRO simple(param1,param2) BLOCK;
		param1 _ param2;
	END; %]
--- js -trim
//line 1 "test_template"

//MACRO
stash.set('simple', function () {
    var output = '';
    var args = {};
    var fargs = Array.prototype.slice.call(arguments);
    args['param1'] = fargs.shift();args['param2'] = fargs.shift();
    args.arguments = Array.prototype.slice.call(arguments);

    var params = fargs.shift() || {};

    for (var key in params) {
        args[key] = params[key];
    }

    context.stash.clone(args);
    try {
//line 1 "test_template"
output += stash.get('param1')  + stash.get('param2');
===
--- macro_call
[% simple('1','2') %]
--- js -trim
//line 1 "test_template"
output += stash.get(['simple', [ '1', '2' ]]);
output += '\n';
===
--- macro_call_with_complex_arguments
[% simple('1' _ '2','3') %]

--- js
//line 1 "test_template"
output += stash.get(['simple', [ '1'  + '2', '3' ]]);
output += '\n';
