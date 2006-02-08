use inc::Module::Install;

name            'Jemplate';
all_from        'lib/Jemplate.pm';

requires        'Template' => '2.14';

use_test_base;

no_index        directory => 'test';

install_share;
install_script  'jemplate';

WriteAll;
