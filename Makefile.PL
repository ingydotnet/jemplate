use inc::Module::Install;

name            'Jemplate';
all_from        'lib/Jemplate.pm';

{
    require ExtUtils::MakeMaker;
    use strict;
    no strict 'refs';

    my $libscan = \&{"ExtUtils::MM_Any::libscan"};
    *{"ExtUtils::MM_Any::libscan"} = sub {
        return '' unless $libscan->(@_);
        return '' if $_[1] =~ /\.sw[p-z]$/;
        return $_[1];
    };
}

#build_requires        'Directory::Scratch';


requires        'Template' => '2.19';
requires        'File::Find::Rule' => '0.30';

use_test_base;

no_index        directory => 'examples';

clean_files     't/Jemplate.js';

install_script  'jemplate';

WriteAll;
