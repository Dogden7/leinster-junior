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

import {parseTeamsheet} from './teamsheets.mjs';
test('extracts fixture IDs from nested controls',()=>{
 const parsed=parse(table+'<ul class="table-body results" data-compname="Junior League Division 1" data-date="04 Oct 2026" data-hometeam="A" data-awayteam="B"><li data-fid="6874133">Team Sheet</li></ul>');
 assert.equal(parsed.matches[0].fixtureId,'6874133');
});
test('keeps home and away numbered squads separate and decodes player names',()=>{
 const parsed=parseTeamsheet('<div class="team_sheets_data"><ul class="hometeam_ul"><ol><li><b>1</b>A &amp; B</li><li><b>16</b>Replacement</li></ol></ul><ul class="awyteam_ul"><ol><li><b>2</b>O&#039;Brien</li></ol></ul></div>');
 assert.deepEqual(parsed.home,[{number:1,name:'A & B'},{number:16,name:'Replacement'}]);
 assert.deepEqual(parsed.away,[{number:2,name:"O'Brien"}]);
 assert.deepEqual(parseTeamsheet('<div class="team_sheets_data"></div>'),{home:[],away:[]});
 assert.throws(()=>parseTeamsheet('Unavailable'));
});
