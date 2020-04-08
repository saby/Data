@Library('pipeline') _

def version = '20.3000'

node ('controls') {
    checkout_pipeline("20.3000/pea/rename_project")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('types', version)
}
