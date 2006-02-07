use Module::Build::JSAN;

my $build = Module::Build::JSAN->new(
    module_name    => 'Jemplate',
    license        => 'perl',
    dist_author    => 'Ingy döt Net <ingy@cpan.org>',
    dist_abstract  => 'Template Toolkit for Javascript',
    dist_version   => '0.10',
    keywords       => [qw(Javascript Template Toolkit)],
    build_requires => {
        'Test.Simple' => 0.20,
    },
    requires     => {
        'Template'     => 2.14,
    },
);

$build->create_build_script;
