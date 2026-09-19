export default function AcademicStructurePage() {
  const modules = [
    ['Boards', 'Supported education boards and curricula.'],
    ['Classes', 'Class levels 1–12 and future levels.'],
    ['Subjects', 'Map subjects to boards and classes.'],
    ['Chapters', 'Organize subject content.'],
    ['Topics', 'Organize chapters into reusable topics.'],
    ['Skills', 'Manage skill categories and skills.'],
  ];
  return <main style={{padding:32}}><h1>Academic Structure</h1><p style={{color:'#64748b',maxWidth:760}}>Central academic configuration for Learn, Play, assignments and competitions.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16,marginTop:24}}>{modules.map(([name,description])=><section key={name} style={{border:'1px solid #e2e8f0',borderRadius:14,padding:20,background:'#fff'}}><h2 style={{marginTop:0}}>{name}</h2><p style={{color:'#64748b'}}>{description}</p><button disabled style={{padding:'9px 14px',borderRadius:8,border:'1px solid #cbd5e1',background:'#f8fafc'}}>CRUD pending Firebase connection</button></section>)}</div></main>;
}
