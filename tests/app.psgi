use Cwd;
use Plack::App::Directory;
my $app = Plack::App::Directory->new(root => Cwd::cwd)->to_app;
