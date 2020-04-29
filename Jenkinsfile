@Library('pipeline') _

def version = '20.3100'

node ('controls') {
    checkout_pipeline("20.3000/pea/fix_git_ms")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('types', version)
}
