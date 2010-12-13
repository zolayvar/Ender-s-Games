dojo.provide('unc.random');

unc.random.choice = function(list) {
    if (typeof(list) == 'string') {
        return list;
    }
    var i = Math.floor(Math.random() * list.length);
    return list[i];
};

unc.random.shuffle = function(myArray) {
    var i = myArray.length;
    if ( i == 0 ) return false;
    while ( --i ) {
        var j = Math.floor( Math.random() * ( i + 1 ) );
        var tempi = myArray[i];
        var tempj = myArray[j];
        myArray[i] = tempj;
        myArray[j] = tempi;
    }
};

