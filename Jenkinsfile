@Library('pipeline') _

def version = '21.2000'

node ('controls1') {
    checkout_pipeline("21.2000/pea/stage_core_tests")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('types', version)
}
