use inc::Module::Install;

name            'Jemplate';
all_from        'lib/Jemplate.pm';

#build_requires        'Directory::Scratch';

requires        'Template' => '2.14';
requires        'File::Find::Rule' => '0.30';

use_test_base;

no_index        directory => 'examples';

clean_files     't/Jemplate.js';

install_script  'jemplate';

WriteAll;
