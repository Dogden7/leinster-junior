import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parse} from './data.mjs';
const table='<h3>League Table Junior League Division 1</h3><table><tr><td data-title="Team">A &amp; B</td><td data-title="Pld">2</td><td data-title="Pts">8</td></tr></table>';
test('excludes other competitions and preserves scores and table fields',()=>{
 const row=name=>'<ul class="column-seven table-body results" data-compname="'+name+'" data-date="04 Oct 2026" data-hometeam="A &amp; B" data-awayteam="C" data-homescore="11(1T)" data-awayscore="32 (4 3 2)">';
 const data=parse(table+row('Junior League Division 1')+row('Junior Cup')+row('Junior League Division 1'));
 assert.equal(data.matches.length,1);assert.equal(data.matches[0].home,'A & B');assert.equal(data.matches[0].homeScore,'11(1T)');assert.equal(data.table[0].points,'8');assert.equal(data.table[0].position,1);
});
test('rejects missing league data instead of displaying an empty successful update',()=>assert.throws(()=>parse('<html>Unavailable</html>')));
