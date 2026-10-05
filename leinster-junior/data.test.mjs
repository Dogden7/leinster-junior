import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parse} from './data.mjs';
import {parseTeamsheet} from './teamsheets.mjs';

const table='<h3>League Table Leinster League - Division 2A</h3><table><tr><td data-title="Team">Cill Dara 1</td><td data-title="Pld">2</td><td data-title="W">2</td><td data-title="D">0</td><td data-title="L">0</td><td data-title="BP">1</td><td data-title="Pts">9</td></tr></table>';

test('parses the current visible Leinster fixture layout',()=>{
 const html=table+'<ul class="column-seven date-section table-body results"><li>Sat 19/09/2026</li></ul><ul class="column-seven table-body results"><li>15:00</li><li>Cill Dara 1</li><li>59 (9) V 7 (1)</li><li>Longford 1</li><li>Silken Thomas Park</li><li>Full Time</li><li><button data-fid="7001">Team Sheet</button></li></ul><ul class="column-seven date-section table-body fixtures"><li>Sat 10/10/2026</li></ul><ul class="column-seven table-body fixtures"><li>15:00</li><li>New Ross 1</li><li>V</li><li>Clondalkin 1</li><li>Southknock</li><li></li><li><button data-fid="7002">Team Sheet</button></li></ul>';
 const data=parse(html);
 assert.equal(data.matches.length,2);
 assert.equal(data.matches[0].date,'Sat 19 Sep 2026');
 assert.equal(data.matches[0].home,'Cill Dara 1');
 assert.equal(data.matches[0].homeScore,'59 (9)');
 assert.equal(data.matches[0].awayScore,'7 (1)');
 assert.equal(data.matches[0].fixtureId,'7001');
 assert.equal(data.matches[1].type,'fixtures');
 assert.equal(data.table[0].team,'Cill Dara 1');
 assert.equal(data.table[0].points,'9');
});

test('keeps the legacy attribute parser for older SportLoMo markup',()=>{
 const row=name=>'<ul class="column-seven table-body results" data-compname="'+name+'" data-date="04 Oct 2026" data-hometeam="North Kildare 1" data-awayteam="Portlaoise 1" data-homescore="11(1T)" data-awayscore="32 (4 3 2)"><li data-fid="8001">Team Sheet</li></ul>';
 const data=parse(table+row('Leinster League - Division 2A')+row('Leinster League - Division 2B'));
 assert.equal(data.matches.length,1);
 assert.equal(data.matches[0].home,'North Kildare 1');
 assert.equal(data.matches[0].awayScore,'32 (4 3 2)');
 assert.equal(data.matches[0].fixtureId,'8001');
});

test('rejects missing league data instead of displaying an empty successful update',()=>assert.throws(()=>parse('<html>Unavailable</html>')));

test('keeps home and away numbered squads separate and decodes player names',()=>{
 const parsed=parseTeamsheet('<div class="team_sheets_data"><ul class="hometeam_ul"><ol><li><b>1</b>A &amp; B</li><li><b>16</b>Replacement</li></ol></ul><ul class="awyteam_ul"><ol><li><b>2</b>O&#039;Brien</li></ol></ul></div>');
 assert.deepEqual(parsed.home,[{number:1,name:'A & B'},{number:16,name:'Replacement'}]);
 assert.deepEqual(parsed.away,[{number:2,name:"O'Brien"}]);
 assert.deepEqual(parseTeamsheet('<div class="team_sheets_data"></div>'),{home:[],away:[]});
 assert.throws(()=>parseTeamsheet('Unavailable'));
});
