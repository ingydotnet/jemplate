use inc::Module::Package 'Ingy:modern 0.13';

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

if (-e 'inc/.author') {
    my $all_from = join '/', 'lib', split m/-/, name . '.pm';
    `perldoc -tF $all_from > README` if ! -e 'README' || (stat $all_from)[9] > (stat 'README')[9];
}

requires        'Template' => '2.19';
requires        'File::Find::Rule' => '0.30';

tests_recursive;

no_index        directory => 'examples';

clean_files     't/Jemplate.js t/a.js t/b.js t/check.js';
