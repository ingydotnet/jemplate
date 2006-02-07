use inc::Module::Install;

name            'Jemplate';
all_from        'lib/Jemplate.pm';

requires        'Template' => '2.14';

use_test_base;

install_share;
install_script  'jemplate';

WriteAll;
