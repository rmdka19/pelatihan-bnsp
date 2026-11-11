function SkillList() {
    const skills = ['HTML & CSS', 'JavaScript Modern', 'React JS', 'Node JS'];

    return (
        <div>
            <h3>Daftar Materi Keahlian</h3>
            <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
                {
                    skills.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))
                }
            </ul>
        </div>
    );
}

export default SkillList;
