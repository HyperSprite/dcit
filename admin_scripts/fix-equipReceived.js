/* mongodb script
/  this script is for upgrading to DCIT2 from DCIT. 
/  Fixes spelling mistake in equipReceived.
*/

use dcit
db.equipment.update( {}, { $rename: { 'equipRecieved': 'equipReceived'}}, { upsert:false, multi:true } );
