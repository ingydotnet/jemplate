//------------------------------------------------------------------------------
// Debugging Support
//------------------------------------------------------------------------------

function XXX(msg) {
    if (! confirm(msg))
        throw("terminated...");
    return msg;
}

function JJJ(obj) {
    return XXX(JSON.stringify(obj));
}
